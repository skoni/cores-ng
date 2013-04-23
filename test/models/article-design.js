module.exports = {

  views: {
    titles: {
      map: function(doc) {
        if (doc.type === 'Article') {
          emit(doc._id, doc.title);
        }
      }
    }
  }
  
};