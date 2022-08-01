const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId
const asyncLocalStorage = require('../../services/als.service')

async function query(filterBy = {isTemplate: false}) {
    try {
        const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('board')
        const boards = await collection.find(criteria).toArray()
        // console.log(boards);
        return boards
    } catch (err) {
        logger.error('cannot find boards', err)
        throw err
    }

}

async function remove(boardId) {
    try {
        const store = asyncLocalStorage.getStore()
        const { loggedinUser } = store
        const collection = await dbService.getCollection('board')
        // remove only if user is owner/admin
        const criteria = { _id: ObjectId(boardId) }
        if (!loggedinUser.isAdmin) criteria.byUserId = ObjectId(loggedinUser._id)
        const {deletedCount} = await collection.deleteOne(criteria)
        return deletedCount
    } catch (err) {
        logger.error(`cannot remove board ${boardId}`, err)
        throw err
    }
}


async function add(board) {
    try {
        // const boardToAdd = {
        //     byUserId: ObjectId(board.byUserId),
        //     aboutUserId: ObjectId(board.aboutUserId),
        //     txt: board.txt
        // }
        const collection = await dbService.getCollection('board')
        await collection.insertOne(board)
        return board
    } catch (err) {
        logger.error('cannot insert board', err)
        throw err
    }
}

async function update(board) {
    try {
        var id = ObjectId(board._id)
        delete board._id
        const collection = await dbService.getCollection('board')
        await collection.updateOne({ _id: id }, { $set: { ...board } })
        board._id = id
        // console.log('board:', board)
        return board
    } catch (err) {
        logger.error(`cannot update board ${board._id}`, err)
        throw err
    }
}

async function getById(boardId) {
    try {
        const collection = await dbService.getCollection('board')
        const board = collection.findOne({ _id: ObjectId(boardId) })
        return board
    } catch (err) {
        logger.error(`while finding board ${boardId}`, err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    // if (filterBy.isTemplate) criteria.isTemplate = filterBy.isTemplate
    // if (JSON.parse(filterBy.isTemplate)) criteria.isTemplate = { $eq: JSON.parse(filterBy.isTemplate) }
    return criteria
}

module.exports = {
    query,
    remove,
    add,
    update,
    getById,
}


