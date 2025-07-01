class Utils {
  static isEmpty(value) {
    return (
      value == null ||
      (typeof value === 'string' && value.trim().length === 0) ||
      value == ''
    );
  }


  static isEmptyObject(obj) {
    return Object.keys(obj).length === 0  && obj.constructor === Object;
  }

  static isUndefined(value) {
    if (typeof value === 'undefined') {
      return true;
    } else {
      return false;
    }
  }

  static unique() {
    return Math.random().toString().substring(2, 8);
  }

  static formatDate = (date) => {
    let updatedDate = new Date(date),
        month = '' + (updatedDate.getMonth() + 1),
        day = '' + updatedDate.getDate(),
        year = updatedDate.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  };
}

export default Utils;
