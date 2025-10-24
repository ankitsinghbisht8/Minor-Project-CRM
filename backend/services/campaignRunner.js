const Campaign = require('../Models/campaigns');
const Segments = require('../Models/segments/Segments');
const SegmentRules = require('../Models/segments/segmentRules');
const { validateAST, calculateAudience } = require('./segments/AudienceEvaluator');

// In-memory map of active timers per campaign
const activeCampaignTimers = new Map();

async function startCampaignProcessing(campaignId) {
    const campaign = await Campaign.findByPk(campaignId);
    if (!campaign) return;

    if (campaign.status === 'completed' || campaign.status === 'failed') return;

    // Resolve audience from segment rules
    const segment = await Segments.findByPk(campaign.segmentId);
    if (!segment) {
        await campaign.update({ status: 'failed', error: 'Segment not found' });
        return;
    }

    const segmentRules = await SegmentRules.findByPk(segment.segmentRulesId);
    if (!segmentRules || !segmentRules.rules) {
        await campaign.update({ status: 'failed', error: 'Segment rules not found' });
        return;
    }

    const ast = segmentRules.rules;
    const validation = validateAST(ast);
    if (!validation.valid) {
        await campaign.update({ status: 'failed', error: 'Invalid segment rules' });
        return;
    }

    const { audienceSize, customers } = await calculateAudience(ast, { returnCustomers: true });
    await campaign.update({ status: 'in_progress', totalUsers: audienceSize });

    // Simulate sending in batches using a timer
    let index = 0;
    const batchSize = 10; // send 10 per tick
    const timer = setInterval(async () => {
        try {
            // If campaign externally marked failed/completed, stop
            const fresh = await Campaign.findByPk(campaignId);
            if (!fresh || fresh.status !== 'in_progress') {
                clearInterval(timer);
                activeCampaignTimers.delete(campaignId);
                return;
            }

            const remaining = Math.max(0, audienceSize - index);
            const toSend = Math.min(batchSize, remaining);
            if (toSend <= 0) {
                await fresh.update({ status: 'completed' });
                clearInterval(timer);
                activeCampaignTimers.delete(campaignId);
                return;
            }

            // Dummy send: 90% success rate
            let successes = 0;
            let failures = 0;
            for (let i = 0; i < toSend; i++) {
                if (Math.random() < 0.9) successes++; else failures++;
            }

            await fresh.update({
                sentCount: fresh.sentCount + toSend,
                successCount: fresh.successCount + successes,
                failureCount: fresh.failureCount + failures
            });

            index += toSend;
        } catch (err) {
            const fresh = await Campaign.findByPk(campaignId);
            if (fresh) {
                await fresh.update({ status: 'failed', error: err.message });
            }
            clearInterval(timer);
            activeCampaignTimers.delete(campaignId);
        }
    }, 1000);

    activeCampaignTimers.set(campaignId, timer);
}

async function stopCampaignProcessing(campaignId) {
    const timer = activeCampaignTimers.get(campaignId);
    if (timer) {
        clearInterval(timer);
        activeCampaignTimers.delete(campaignId);
    }
}

module.exports = {
    startCampaignProcessing,
    stopCampaignProcessing
};


