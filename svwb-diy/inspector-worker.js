'use strict';
importScripts('calibration.js?v=5.34.0','nonfollowers.js?v=5.34.0','class-identity.js?v=5.34.0','token-delivery.js?v=5.34.0','combinations.js?v=5.34.0','preview-mechanics.js?v=5.34.0','engine.js?v=5.34.0','inspector-search.js?v=5.34.0');
let cancel=null;
self.onmessage=({data})=>{
  if(cancel)cancel();
  try{cancel=SVWBSearch.scan(SVWB,data,result=>self.postMessage(result));}
  catch(e){self.postMessage({error:e.message});}
};
