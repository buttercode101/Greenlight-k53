const date=/^\d{4}-\d{2}-\d{2}$/;
function requireText(value,label){if(typeof value!=='string'||!value.trim())throw Error(`Missing ${label}`);}
export function applyReviews(records,entries){
  const byId=new Map(records.map(r=>[r.id,r]));
  const seen=new Set();
  for(const entry of entries){
    if(seen.has(entry.id))throw Error(`Duplicate review: ${entry.id}`);
    seen.add(entry.id);
    const record=byId.get(entry.id);
    if(!record)throw Error(`Unknown reviewed item: ${entry.id}`);
    if(entry.sha256_16!==record.sha256_16)throw Error(`Stale review for ${entry.id}: content changed; recheck it`);
    const check=entry.sourceCheck;
    if(!check)throw Error(`Missing source check for ${entry.id}`);
    requireText(check.url,'source URL');
    if(!/^https:\/\//.test(check.url))throw Error('Source URL must use HTTPS');
    for(const key of ['locator','checkedBy','method','finding'])requireText(check[key],key);
    if(!date.test(check.checkedDate))throw Error('Source check needs an ISO date');
    record.source=check.url;
    record.sourceLocator=check.locator;
    record.sourceCheck=check;
    const review=entry.independentReview;
    if(review){
      for(const key of ['reviewer','qualification','evidence'])requireText(review[key],key);
      if(!date.test(review.reviewDate))throw Error('Independent review needs an ISO date');
      if(review.answerChecked!==true||review.explanationChecked!==true||review.choicesChecked!==true)throw Error('Independent review must check answer, explanation and choices');
      record.reviewer=review.reviewer;record.reviewDate=review.reviewDate;
      record.reviewStatus='Independently reviewed';record.independentReview=review;
    }
  }
  return records;
}
export function requireReviewedRelease(records){
  const pending=records.filter(r=>r.reviewStatus!=='Independently reviewed');
  if(pending.length)throw Error(`Verified release blocked: ${pending.length} of ${records.length} items await independent review`);
}
