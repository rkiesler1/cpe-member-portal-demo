// This function is the webhook's request handler.
exports = async function(payload) {
  /*===============================================================
  - Date:       Author:           Version:        Notes:
  -----------------------------------------------------------------
  - 2021-02-28  Roy Kiesler       1.0            Initial Release
  -
  ===============================================================*/

    // Query params, e.g. '?q=fitness dallas
    const collection = context.services.get("mongodb-atlas").db("CPE").collection("events");
    const q = payload.query.q;
    const coords = EJSON.parse(payload.query.coordinates);
    const radius = payload.query.radius || 100;   // find events in 100mi radius if not otherwise specified
    const filters = payload.query.filters ? decodeURIComponent(payload.query.filters).split(',') : null;

    let pipeline = [
      {$search: {
        index: 'event_search',
        compound: {
          must: [{
            text: {
              query: q,
              path: 'Event',
              fuzzy: { "maxEdits": 2, "prefixLength": 2 }
            }
          }],
          should: [{
            near: {
              origin: {
                type: "Point",
                coordinates: coords
              },
              pivot: radius*1609,
              path: "location"
            }
          }]
        },
        highlight: {
          path: 'Event'
        }
      }},
      {$addFields: {
        score: {$meta: "searchScore"},
        highlights: {$meta: "searchHighlights"}
      }},
      {$limit: 12}
    ];
    
    let filterProp;
    if (!!filters && filters.length > 0) {
      let qs = '';
      filters.map((filter, index) => {
        qs += ('Category:' + filter + (filters.length === index + 1 ? '' : ' OR '));
      });
      filterProp = [{
        queryString: {
          defaultPath: "Category",
          query: qs
        }
      }];
      pipeline[0]["$search"]["compound"]["filter"] = filterProp;
      //console.log(JSON.stringify(pipeline));
    }

    let events = await collection.aggregate(pipeline).toArray();
    
    return events;
};