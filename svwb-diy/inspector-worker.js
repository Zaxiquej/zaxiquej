'use strict';
importScripts('calibration.js?v=5.27.0','nonfollowers.js?v=5.27.0','class-identity.js?v=5.18.3','token-delivery.js?v=5.18.3','combinations.js?v=5.27.0','engine.js?v=5.27.0','inspector-search.js?v=5.18.3');
let cancel=null;
self.onmessage=({data})=>{
  if(cancel)cancel();
  try{cancel=SVWBSearch.scan(SVWB,data,result=>self.postMessage(result));}
  catch(e){self.postMessage({error:e.message});}
};
