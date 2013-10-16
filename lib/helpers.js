function wrapper(str){
  return "("+str+")";
}
function attr_value_escape(value){
  return "'"+str(value).replace(/'/g, "''")+"'";
}
function str(obj){
  return ''+obj;
}
function attr_name_escape(name){
  var reserved = ["or","and","not","from","where","select","like","null","is","order","by","asc","desc","in","between","intersection","limit","every"];
  var unescape_regex = /^[a-z_\$][\w_\$]*$/i;
  if(~reserved.indexOf(name) || !unescape_regex.test(name)){
    name = "`"+name.replace(/`/g, "``")+"`";
  }
  return name;
}

module.exports = {
  wrapper: wrapper,
  attr_name_escape: attr_name_escape,
  attr_value_escape: attr_value_escape,
  str: str,
}
