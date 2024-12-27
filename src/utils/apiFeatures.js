
export class APIFeature {
    constructor(query,queryString){
      this.query=query;
      this.queryString = queryString;
    }
    filter(){
      if(this.queryString){
        const queryObj = {...this.queryString};
        // delete all non filter query params
        const nonFilteringParams = ['page', 'sort', 'limit', 'fields'];
        nonFilteringParams.forEach(el=>delete queryObj[el]);
        // Advanced Filtering
        let formattedQuery = JSON.stringify(queryObj).replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        console.log('formattedQuery', formattedQuery);
        this.query.find(JSON.parse(formattedQuery));
      }
      return this;
    }
    sort(){
        // Sorting
        if(this.queryString && this.queryString.sort){
          const sortBy = this.queryString.sort.split(',').join(' ');
          this.query.sort(sortBy);
        } else {
          this.query.sort('-createdAt');
        }
        return this;
    }
    fieldLimit(){
         //Fields Limiting
         if(this.queryString.fields){
          const selectedFields = this.queryString.fields.split(',').join(' ')
          this.query.select(selectedFields);
        }else{
          this.query.select('-__v');
        }
        return this;
    }
    pagination(){
      if(this.queryString && this.queryString.page && this.queryString.limit){
        // Pagination
        const page  = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 10;
        const skip = limit * (page-1);
        this.query.skip(skip).limit(limit);
      }
      return this;
    }
  
    
  } 
