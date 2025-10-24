const express = require('express');
const router = express.Router();
const Campaign = require('../Models/campaigns');
const Segments = require('../Models/segments/Segments');
const { startCampaignProcessing } = require('../services/campaignRunner');

// Create and start a campaign for a segment
router.post('/campaigns', async (req, res) => {
    try {
        const { segmentId, name, message } = req.body || {};
        if (!segmentId) return res.status(400).json({ error: 'segmentId is required' });
        if (!name || !name.trim()) return res.status(400).json({ error: 'name is required' });

        const segment = await Segments.findByPk(segmentId);
        if (!segment) return res.status(404).json({ error: 'Segment not found' });

        const campaign = await Campaign.create({
            name: name.trim(),
            segmentId,
            message: (message && message.trim()) || (segment.description || '').toString(),
            status: 'queued'
        });

        // Kick off async processing
        startCampaignProcessing(campaign.id).catch(() => {});

        res.status(201).json(campaign);
    } catch (err) {
        console.error('Failed to create campaign:', err);
        res.status(500).json({ error: 'Failed to create campaign', details: err.message });
    }
});

// Get all campaigns
router.get('/campaigns', async (_req, res) => {
    try {
        const campaigns = await Campaign.findAll({ order: [['createdAt', 'DESC']] });
        res.json(campaigns);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch campaigns', details: err.message });
    }
});

// Get single campaign by id
router.get('/campaigns/:id', async (req, res) => {
    try {
        const campaign = await Campaign.findByPk(req.params.id);
        if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
        res.json(campaign);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch campaign', details: err.message });
    }
});

module.exports = router;


