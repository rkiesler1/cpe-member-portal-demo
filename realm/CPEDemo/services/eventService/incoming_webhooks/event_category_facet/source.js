// This function is the webhook's request handler.
exports = async function(payload) {
  /*===============================================================
  - Date:       Author:           Version:        Notes:
  -----------------------------------------------------------------
  - 2021-03-05  Roy Kiesler       1.0            Initial Release
  -
  ===============================================================*/
    const collection = context.services.get("mongodb-atlas").db("CPE").collection("events");

    const facetPipeline = [
      { $unwind: { path: '$Category' }},
      { $facet: {
        categories: [
          {$sortByCount: '$Category'},
          {$project: {
            'name': '$_id',
            '_id': 0,
            count: 1
          }}
        ]
      }}
    ];
  	let facets = await collection.aggregate(facetPipeline).toArray();

    return  facets;
};