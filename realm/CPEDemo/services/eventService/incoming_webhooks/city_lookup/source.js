// This function is the webhook's request handler.
exports = async function(payload) {
  /*===============================================================
  - Date:       Author:           Version:        Notes:
  -----------------------------------------------------------------
  - 2021-02-22  Roy Kiesler       1.0            Initial Release
  -
  ===============================================================*/
    const collection = context.services.get("mongodb-atlas").db("CPE").collection("geo");
  	let q = payload.query.q;

  	let cities = await collection.aggregate([
  	  {$search: {
  	    index: "geo_lookup",
        autocomplete: { path: 'city', query: q } 
      }}, 
      {$project: {
        city: 1,
        _id: 0,
        state_id: 1,
        coordinates: 1,
        score: {$meta: 'searchScore'}
      }},
      {$limit: 12}
    ]).toArray();
    
    return  cities;
};