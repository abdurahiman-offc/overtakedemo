import Lead from '../models/Lead.js';
import ApiLead from '../models/ApiLead.js';

export const captureWebhookLead = async (req, res, next) => {
    try {
        const { leadOrigin, leadinfo } = req.body;
        
        if (!leadinfo) {
             return res.status(400).json({ message: 'leadinfo object is required for webhook submission.' });
        }

        const name = leadinfo.first_name || leadinfo.name;
        const phone = leadinfo.whatsapp_phone ? leadinfo.whatsapp_phone.replace(/\D/g, '') : (leadinfo.phone ? leadinfo.phone.replace(/\D/g, '') : null);
        
        if (!name || !phone) {
            return res.status(400).json({ message: 'Name and phone inside leadinfo are required.' });
        }

        const existingApiLead = await ApiLead.findOne({ phone: phone.trim() });
        if (existingApiLead) {
            return res.status(409).json({ message: 'An API lead with this phone number is already pending.' });
        }
        
        const existingMainLead = await Lead.findOne({ phone: phone.trim() });
        if (existingMainLead) {
            return res.status(409).json({ message: 'A lead with this phone number already exists in the main CRM.' });
        }

        const validOrigins = ['whatsapp', 'insta', 'fb', 'walk-in', 'tele', 'referral', 'web', 'olx', 'other'];
        let finalOrigin = (leadOrigin || leadinfo.leadOrigin || 'other').toLowerCase();
        if (!validOrigins.includes(finalOrigin)) {
            finalOrigin = 'other';
        }

        const carDetailsArray = [];
        const custom = leadinfo.custom_fields || {};
        const intent = custom.intention ? custom.intention.toLowerCase() : null;
        
        if (intent === 'buying' || intent === 'selling' || intent === 'exchange') {
            const carDetail = { intent };
            if (intent === 'buying') {
                carDetail.wantedCar = { brandName: custom['buy brand'], modelName: custom['buy model'] };
            } else if (intent === 'selling') {
                carDetail.ownedCar = { brandName: custom['sell brand'], modelName: custom['sell model'], year: custom['sell model year'], kmDriven: custom['sell model km'] };
            } else if (intent === 'exchange') {
                carDetail.ownedCar = { brandName: custom['exchange car brand owning'], modelName: custom['exchange car model owning'] };
                carDetail.wantedCar = { brandName: custom['exchange car brand looking'], modelName: custom['exchange car model looking'] };
            }
            carDetailsArray.push(carDetail);
        }

        const notesArray = [];
        if (custom.Note) notesArray.push(custom.Note);

        const leadData = {
           name: name.trim(),
           phone: phone.trim(),
           leadOrigin: finalOrigin,
           notes: notesArray,
           carDetails: carDetailsArray
        };

        const apiLead = new ApiLead(leadData);
        await apiLead.save();

        res.status(201).json({
            status: 'success',
            message: 'Lead successfully captured and staged via webhook.',
            data: {
                id: apiLead._id,
                name: apiLead.name,
                phone: apiLead.phone,
                leadOrigin: apiLead.leadOrigin,
                vehiclesEnquired: apiLead.carDetails.length
            }
        });
    } catch (error) { next(error); }
};
