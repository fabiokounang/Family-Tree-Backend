const { default: mongoose } = require("mongoose");

module.exports = (req, sortAttr = 'username', searchAvailable = ['username']) => {
  let page = req.body.page ? +req.body.page : 0;
  let limit = req.body.limit ? +req.body.limit : 10;
  let sort_attr = req.body.sort_attr ? req.body.sort_attr : sortAttr;
  let sort = req.body.sort ? req.body.sort : '-1';
  let search = req.body.search ? req.body.search : '';
  let objFilterSearch = {};

  try {
    let filteredData = req.body.filter ? Object.keys(req.body.filter) : {};
    if (filteredData.length > 0) {
      filteredData.forEach((key) => {
        if (key === 'province') {
          objFilterSearch = Object.assign(objFilterSearch, {
            place_of_birth: { 
              $in: req.body.filter[key]
            }
          });
        } else if (key === 'token_fcm') {
          objFilterSearch = Object.assign(objFilterSearch, {
            [key]: {
              $ne: null
            }
          });
        } else {
          objFilterSearch = Object.assign(objFilterSearch, {
            [key]: req.body.filter[key]
          });
        }
      });
    }

    if (search) {
      console.log(searchAvailable)
      objFilterSearch = Object.assign(objFilterSearch, {
        $or: searchAvailable.map((key) => {
          return {
            [key]: {
              $regex: search,
              $options: 'i'
            }
          }        
        })
      });
    }
    return { 
      page: page, 
      limit: limit, 
      sort: {
        [sort_attr]: sort
      }, 
      objFilterSearch: objFilterSearch
    };
  } catch (error) {
    return {};
  }
}