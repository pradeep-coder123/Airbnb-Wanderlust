// module.exports = (fn)=>{
//     return (req,res,next)=>{
//         fn(req,res,next).catch(next);
//     }
// }
// function asyncWrap(fn){
//    return function (req,res,next){
//       fn(req,res,next).catch((err) => next(err) );
//    };
// }
module.exports = (fn) => {
    return function (req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};