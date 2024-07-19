const fs = require('fs');
const { createObjectCsvWriter } = require('csv-writer');
const { processCSV, updateVoteData, updateLegislatorData, processVotes } = require('./index');

jest.mock('fs');
jest.mock('csv-writer', () => ({
  createObjectCsvWriter: jest.fn(() => ({
    writeRecords: jest.fn().mockResolvedValue()
  }))
}));

jest.mock('csv-parser', () => jest.fn(() => ({
  on: jest.fn(function (event, callback) {
    if (event === 'data') {
      callback({ id: '1', name: 'Test' });
    }
    if (event === 'end') {
      callback();
    }
    return this;
  })
})));

describe('CSV Utils', () => {
  beforeEach(() => {
    fs.createReadStream.mockClear();
  });

  test('updateVoteData updates vote count correctly', () => {
    const votes = new Map();
    const data = { vote_id: '1', vote_type: '1' };
    updateVoteData(votes, data);
    expect(votes.get('1')).toEqual({ supporter_count: 1, opposer_count: 0 });
  });

  test('updateLegislatorData updates legislator vote data correctly', () => {
    const legislatoresVotes = new Map();
    const data = { legislator_id: '1', vote_type: '1' };
    updateLegislatorData(legislatoresVotes, data);
    expect(legislatoresVotes.get('1')).toEqual({ num_supported_bills: 1, num_opposed_bills: 0 });
  });

  test('processCSV reads data from CSV file', async () => {
    const mockData = { id: '1', name: 'Test' };
    fs.createReadStream.mockReturnValue({
      pipe: jest.fn(() => ({
        on: jest.fn(function (event, callback) {
          if (event === 'data') {
            callback(mockData);
          }
          if (event === 'end') {
            callback();
          }
          return this;
        })
      }))
    });

    const onData = jest.fn();
    await processCSV('mockPath', onData);
    expect(onData).toHaveBeenCalledWith(mockData);
  });

  test('processVotes processes CSV files and writes results', async () => {
    fs.createReadStream.mockReturnValue({
      pipe: jest.fn(() => ({
        on: jest.fn(function (event, callback) {
          if (event === 'data') {
            callback({ id: '1', vote_id: '1', vote_type: '1', bill_id: '1', sponsor_id: '1', legislator_id: '1', title: 'Test', name: 'Test' });
          }
          if (event === 'end') {
            callback();
          }
          return this;
        })
      }))
    });

    await processVotes();
    expect(createObjectCsvWriter).toHaveBeenCalled();
  });
});
