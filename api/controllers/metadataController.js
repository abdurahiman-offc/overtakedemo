import Tag from '../models/Tag.js';
import SmartList from '../models/SmartList.js';

export const getTags = async (req, res, next) => {
    try {
        const tags = await Tag.find().sort({ createdAt: -1 });
        res.json(tags);
    } catch (error) { next(error); }
};

export const createTag = async (req, res, next) => {
    try {
        const tag = new Tag(req.body);
        await tag.save();
        res.status(201).json(tag);
    } catch (error) { next(error); }
};

export const deleteTag = async (req, res, next) => {
    try {
        await Tag.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted successfully' });
    } catch (error) { next(error); }
};

export const getSmartLists = async (req, res, next) => {
    try {
        const lists = await SmartList.find().sort({ createdAt: -1 });
        res.json(lists);
    } catch (error) { next(error); }
};

export const createSmartList = async (req, res, next) => {
    try {
        const list = new SmartList(req.body);
        await list.save();
        res.status(201).json(list);
    } catch (error) { next(error); }
};

export const deleteSmartList = async (req, res, next) => {
    try {
        await SmartList.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted successfully' });
    } catch (error) { next(error); }
};
