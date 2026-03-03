import express from 'express';
import Lead from '../models/Lead.js';
import User from '../models/User.js';
import SmartList from '../models/SmartList.js';
import Tag from '../models/Tag.js';

const router = express.Router();

// --- USERS --- //
router.get('/users', async (req, res, next) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.json(users);
    } catch (error) { next(error); }
});

router.post('/users', async (req, res, next) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json(user);
    } catch (error) { next(error); }
});

// --- TAGS --- //
router.get('/tags', async (req, res, next) => {
    try {
        const tags = await Tag.find().sort({ createdAt: -1 });
        res.json(tags);
    } catch (error) { next(error); }
});

router.post('/tags', async (req, res, next) => {
    try {
        const tag = new Tag(req.body);
        await tag.save();
        res.status(201).json(tag);
    } catch (error) { next(error); }
});

router.delete('/tags/:id', async (req, res, next) => {
    try {
        await Tag.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted successfully' });
    } catch (error) { next(error); }
});

// --- SMART LISTS --- //
router.get('/smartlists', async (req, res, next) => {
    try {
        const lists = await SmartList.find().sort({ createdAt: -1 });
        res.json(lists);
    } catch (error) { next(error); }
});

router.post('/smartlists', async (req, res, next) => {
    try {
        const list = new SmartList(req.body);
        await list.save();
        res.status(201).json(list);
    } catch (error) { next(error); }
});

router.delete('/smartlists/:id', async (req, res, next) => {
    try {
        await SmartList.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted successfully' });
    } catch (error) { next(error); }
});

// --- LEADS --- //
router.get('/leads', async (req, res, next) => {
    try {
        const leads = await Lead.find()
            .populate('assignedTo', 'username email')
            .populate('assignmentHistory.userId', 'username')
            .sort({ createdAt: -1 });
        res.json(leads);
    } catch (error) { next(error); }
});

router.get('/leads/:id', async (req, res, next) => {
    try {
        const lead = await Lead.findById(req.params.id)
            .populate('assignedTo', 'username email')
            .populate('assignmentHistory.userId', 'username');
        if (!lead) return res.status(404).json({ message: 'Lead not found' });
        res.json(lead);
    } catch (error) { next(error); }
});

router.post('/leads', async (req, res, next) => {
    try {
        // If assigned immediately on creation
        if (req.body.assignedTo) {
            req.body.assignmentHistory = [{
                userId: req.body.assignedTo,
                assignedBy: 'System (Creation)'
            }];
        }
        const lead = new Lead(req.body);
        await lead.save();
        res.status(201).json(lead);
    } catch (error) { next(error); }
});

router.put('/leads/:id', async (req, res, next) => {
    try {
        const leadId = req.params.id;
        const updates = req.body;

        // Check if assignment changed
        if (updates.assignedTo) {
            const existingLead = await Lead.findById(leadId);
            if (existingLead && (!existingLead.assignedTo || existingLead.assignedTo.toString() !== updates.assignedTo)) {
                // Push new assignment record
                const newRecord = {
                    userId: updates.assignedTo,
                    assignedBy: 'System (Update)'
                };
                if (!updates.assignmentHistory) {
                    updates.assignmentHistory = existingLead.assignmentHistory || [];
                }
                updates.assignmentHistory.push(newRecord);
            }
        }

        const updatedLead = await Lead.findByIdAndUpdate(leadId, updates, { new: true })
            .populate('assignedTo', 'username email')
            .populate('assignmentHistory.userId', 'username');

        if (!updatedLead) return res.status(404).json({ message: 'Lead not found' });
        res.json(updatedLead);
    } catch (error) { next(error); }
});

router.delete('/leads/:id', async (req, res, next) => {
    try {
        await Lead.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted successfully' });
    } catch (error) { next(error); }
});

// --- BULK ACTIONS --- //
router.post('/leads/bulk-delete', async (req, res, next) => {
    try {
        const { ids } = req.body;
        await Lead.deleteMany({ _id: { $in: ids } });
        res.json({ message: 'Bulk delete successful' });
    } catch (error) { next(error); }
});

router.post('/leads/bulk-assign', async (req, res, next) => {
    try {
        const { ids, userId } = req.body;

        // Update many and also should ideally update assignmentHistory, 
        // but for bulk updating many histories is complex in a single query.
        // We will update the leads and add a generic history record to each.
        const leadsToUpdate = await Lead.find({ _id: { $in: ids } });

        const updatePromises = leadsToUpdate.map(lead => {
            lead.assignedTo = userId;
            lead.assignmentHistory.push({
                userId,
                assignedBy: 'System (Bulk Assignment)'
            });
            return lead.save();
        });

        await Promise.all(updatePromises);
        res.json({ message: 'Bulk assignment successful' });
    } catch (error) { next(error); }
});

router.post('/leads/bulk-update', async (req, res, next) => {
    try {
        const { ids, updates, addTags, removeTags } = req.body;
        const mongoUpdate = {};

        if (updates && Object.keys(updates).length > 0) mongoUpdate.$set = updates;
        if (addTags && addTags.length > 0) mongoUpdate.$addToSet = { tags: { $each: addTags } };
        if (removeTags && removeTags.length > 0) mongoUpdate.$pull = { tags: { $in: removeTags } };

        if (Object.keys(mongoUpdate).length === 0) {
            return res.status(400).json({ message: 'No updates provided' });
        }

        await Lead.updateMany(
            { _id: { $in: ids } },
            mongoUpdate
        );

        res.json({ message: 'Bulk update successful' });
    } catch (error) { next(error); }
});

export default router;
