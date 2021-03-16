// This function is the webhook's request handler.
exports = async function(payload) {
  /*===============================================================
  - Date:       Author:           Version:        Notes:
  -----------------------------------------------------------------
  - 2021-02-22  Roy Kiesler       1.0            Initial Release
  -
  ===============================================================*/
  
    // Query params, e.g. '?coordinates=[-123,456]&radius=100' => {coordinates: [-123,456], radius: 100}
    const coordinates = EJSON.parse(payload.query.coordinates);
    const radius = payload.query.radius || 100;   // find events in 100mi radius if not otherwise specified
    const filters = payload.query.filters ? decodeURIComponent(payload.query.filters).split(',') : null;

    let conn = context.services.get("mongodb-atlas").db("CPE").collection("events");
    // basic geo query
    let coordsQuery = {
      coordinates: {
        $geoWithin: { 
          $centerSphere: [ coordinates, radius/3963.2 ]
        }
      }
    };
    
    // search for events in radius from user's current location
    // note: convert the distance to radians by dividing by the approximate equatorial radius of the earth, 3963.2 miles
    let events;
    if (filters && filters.length > 0) {
      // add filters to query
      console.log(`Filters: ${filters}`);
      events = await conn.find({
        coordinates: coordsQuery.coordinates,
        Category: {$elemMatch: {$in: filters}}
      });
    } else {
      // just the basic geo query, no filters
      console.log(`No filters -- searching using ${JSON.stringify(coordsQuery)}`);
      events = await conn.find(coordsQuery);
    }
    console.log("done");
    return  events;
};