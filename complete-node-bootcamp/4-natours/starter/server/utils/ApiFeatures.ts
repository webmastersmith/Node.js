import { Model } from 'mongoose';
// import { inspect } from 'node:util';

type QueryObj = {
  page?: string;
  sort?: string;
  limit?: string;
  fields?: string;
  [key: string]: any;
};

export default class ApiFeatures {
  model: ReturnType<typeof Model.find>;
  query: ReturnType<typeof Model.find> | undefined;
  reqQuery: QueryObj;

  constructor(model: ReturnType<typeof Model.find>, reqQuery: QueryObj) {
    this.reqQuery = reqQuery;
    this.model = model;
    this.query;
  }

  filter() {
    // http://172.30.99.131:8080/api/v1/tours?duration[gte]=5&difficulty=easy&page=2
    const reqObj = { ...this.reqQuery };
    // remove key words
    ['page', 'sort', 'limit', 'fields'].forEach(
      (element: string) => delete reqObj[element]
    );
    // replace the logic operators with '$' in front of them.
    const reqObjString = JSON.stringify(reqObj).replace(
      /\b(lt|lte|gt|gte)\b/g,
      (match) => `$${match}`
    );
    // instantiate query (Model).
    console.log('ApiFeature', reqObjString);
    this.query = this.model.find(JSON.parse(reqObjString));
    return this;
  }

  // sort
  sort() {
    // sort
    if (this.query !== undefined) {
      if (typeof this.reqQuery?.sort === 'string') {
        this.query = this.query.sort(this.reqQuery.sort.split(',').join(' '));
      } else {
        this.query = this.query.sort('-createdAt'); // newest first.
      }
    }
    return this;
  }

  // fields
  fields() {
    // fields -limit return items
    if (this.query !== undefined) {
      if (typeof this.reqQuery?.fields === 'string') {
        const field = this.reqQuery.fields.split(',').join(' ');
        console.log(field);
        this.query = this.query.select(field);
      } else {
        this.query = this.query.select('-__v');
      }
    }
    return this;
  }

  // page limit
  pageLimit() {
    // page & limit
    if (this.query !== undefined) {
      if (
        typeof this.reqQuery?.page === 'string' ||
        typeof this.reqQuery?.limit === 'string'
      ) {
        const page = +(this.reqQuery?.page || 1);
        const limit = +(this.reqQuery?.limit || 100);
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);
      }
    }
    // console.log('ApiFeature pageLimit', inspect(this.query));
    return this;
  }
}
