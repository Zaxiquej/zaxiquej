'use strict';
importScripts('calibration.js?v=5.18.3','nonfollowers.js?v=5.18.3','class-identity.js?v=5.18.3','token-delivery.js?v=5.18.3','combinations.js?v=5.21.0','engine.js?v=5.21.2','inspector-search.js?v=5.18.3');
let cancel=null;
self.onmessage=({data})=>{
  if(cancel)cancel();
  try{cancel=SVWBSearch.scan(SVWB,data,result=>self.postMessage(result));}
  catch(e){self.postMessage({error:e.message});}
};
