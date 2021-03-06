const redis = require('./redis')
const sql = require('./sql')
const admin = require('./config')
async function check_admin(Tg_id) { //检测是否是机器人管理员,bool
    switch (Tg_id == admin.Super_admin) {
        case true:
            return true
        case false:
            return false
    }
}
async function check_black(uid) { //检测缓存是否是黑名单,如果是就删除缓存
    try {
        data = await sql.query(`insert into bili_uid(uid,mode) values(${uid},'black') on duplicate key update uid=${uid},mode='black'`)
    } catch (error) {
        console.log(error)
        return 'UID:' + uid + '黑名单添加失败'
    }
    redis_black = await redis.get('uid' + uid)
    switch (redis_black) {
        case 'black':
            return 'UID:' + uid + '已添加黑名单成功，缓存是黑名单'
        case 'visit':
            redis.del('uid' + uid)
            return 'UID:' + uid + '已添加黑名单成功，缓存是游客,并清除缓存'
        case 'white':
            redis.del('uid' + uid)
            return 'UID:' + uid + '已添加黑名单成功,缓存是白名单,并清除缓存'
        default:
            return 'UID:' + uid + '已添加黑名单成功,没有缓存'
    }

}
async function check_white(uid) { //检测缓存是否是白名单,如果是就删除缓存
    try {
        data = await sql.query(`insert into bili_uid(uid,mode) values(${uid},'white') on duplicate key update uid=${uid},mode='white'`)
    } catch (error) {
        console.log(error)
        return 'UID:' + uid + '白名单添加失败'
    }
    redis_white = await redis.get('uid' + uid)
    switch (redis_white) {
        case 'black':
            redis.del('uid' + uid)
            return 'UID:' + uid + '已添加白名单成功,缓存是黑名单,并清除缓存'
        case 'visit':
            redis.del('uid' + uid)
            return 'UID:' + uid + '已添加白名单成功，缓存是游客,并清除缓存'
        case 'white':
            return 'UID:' + uid + '已添加白名单成功,缓存是白名单'
        default:
            return 'UID:' + uid + '已添加白名单成功,没有缓存'
    }

}
async function del_uid(uid) {
    try {
        data = await sql.query(`DELETE FROM bili_uid where uid=${uid}`)
        redis.del('uid' + uid)
        switch (data.affectedRows) {
            case 1:
                return 'UID:' + uid + '删除成功'
            case 0:
                return 'UID:' + uid + '删除失败,数据库没有此uid'
            default:
                return '未知错误'
        }
    } catch (error) {
        console.log(error)
        return 'UID:' + uid + '删除失败,程序错误'
    }
}
module.exports = {
    check_admin,
    check_black,
    check_white,
    del_uid
}