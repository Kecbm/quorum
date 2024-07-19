const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const legislatorSupportWriter = createCsvWriter({
    path: 'results/legislators-support-oppose-count.csv',
    header: [
        { id: 'id', title: 'id' },
        { id: 'name', title: 'name' },
        { id: 'num_supported_bills', title: 'num_supported_bills' },
        { id: 'num_opposed_bills', title: 'num_opposed_bills' }
    ]
});

const billSupportWriter = createCsvWriter({
    path: 'results/bills-support-oppose-count.csv',
    header: [
        { id: 'bill_id', title: 'id' },
        { id: 'title', title: 'title' },
        { id: 'supporter_count', title: 'supporter_count' },
        { id: 'opposer_count', title: 'opposer_count' },
        { id: 'sponsor', title: 'primary_sponsor' }
    ]
});

const processCSV = (filePath, onData) => new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', onData)
        .on('end', resolve)
        .on('error', reject);
});

const updateVoteData = (votes, data) => {
    const voteData = votes.get(data.vote_id) || { supporter_count: 0, opposer_count: 0 };
    data.vote_type === '1' ? voteData.supporter_count++ : voteData.opposer_count++;
    votes.set(data.vote_id, voteData);
};

const updateLegislatorData = (legislatoresVotes, data) => {
    let legislatorVotes = legislatoresVotes.get(data.legislator_id) || { num_supported_bills: 0, num_opposed_bills: 0 };
    data.vote_type === '1' ? legislatorVotes.num_supported_bills++ : legislatorVotes.num_opposed_bills++;
    legislatoresVotes.set(data.legislator_id, legislatorVotes);
};

const processVotes = async () => {
    const votes = new Map();
    const storeBillVotes = {};
    const storeSponsorVote = {};
    const legislatoresVotes = new Map();
    const legislatorSupport = [];

    await processCSV('data/votes.csv', data => {
        votes.set(data.id, { bill_id: data.bill_id, supporter_count: 0, opposer_count: 0 });
        storeBillVotes[data.bill_id] = data.id;
    });

    await processCSV('data/vote_results.csv', data => {
        updateVoteData(votes, data);
        updateLegislatorData(legislatoresVotes, data);
    });

    await processCSV('data/bills.csv', data => {
        const vote_id = storeBillVotes[data.id];
        const voteData = votes.get(vote_id) || {};
        votes.set(vote_id, { ...voteData, title: data.title, sponsor_id: data.sponsor_id, sponsor: "Unknown" });
        storeSponsorVote[data.sponsor_id] = vote_id;
    });

    await processCSV('data/legislators.csv', data => {
        const vote_id = storeSponsorVote[data.id];
        if (vote_id) {
            const voteData = votes.get(vote_id);
            votes.set(vote_id, { ...voteData, sponsor: data.name });
        }

        const legislatorData = legislatoresVotes.get(data.id) || { num_supported_bills: 0, num_opposed_bills: 0 };
        legislatorSupport.push({
            id: data.id,
            name: data.name,
            num_supported_bills: legislatorData.num_supported_bills,
            num_opposed_bills: legislatorData.num_opposed_bills
        });
    });

    await Promise.all([
        legislatorSupportWriter.writeRecords(legislatorSupport),
        billSupportWriter.writeRecords([...votes.values()])
    ]);

    console.log('CSV files processed successfully.');
};

processVotes().catch(error => console.error('Error processing CSV files:', error.message));

module.exports = {
    processCSV,
    updateVoteData,
    updateLegislatorData,
    processVotes
};
