<h1 id="top" align="center">Welcome to the Quorum Mid Level Full Stack Developer Technical Challenge repository</h1>

<h2>Summary:</h2>

- [What was developed](#summary)
- [Technologies used](#tech)
- [Execute the project](#execute)
- [Documentation](#doc)
- [Next Steps](#nextSteps)
- [Final considerations](#considerations)

---

<h2 id="summary">What was developed</h2>

<br>

An `API` for processing CSV files using `Node.js`, `JavaScript` and `Express`. Also develop a front end using `HTML` and `CSS` to display the results.

<br>

<p align="right"><a href="#top">Back to the top ☝</a></p>

---

<h2 id="tech">Technologies used</h2>

<br>

<img title="Node" alt="Node" height="80" width="80" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg" /> <img title="JavaScript" alt="JavaScript" height="80" width="80" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg" /> <img title="Express" alt="Express" height="80" width="80" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/express/express-original.svg" /> <img title="HTML" alt="HTML" height="80" width="80" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg" /> <img title="CSS" alt="CSS" height="80" width="80" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg" />

<br>

<p align="right"><a href="#top">Back to the top ☝</a></p>

---

<h2 id="execute">Execute the project</h2>

<br>

Clone the repository

```bash
git clone https://github.com/Kecbm/quorum.git
```

<br>

Install dependencies

```bash
cd quorum
npm install
```

<br>

Execute the API for generating CSV files

```bash
cd quorum
npm start
```

> At this moment, the files `bills-support-oppose-count.csv` and `legislators-support-oppose-count.csv` are already generated in the `results` folder. To generate them again it is necessary to delete the files in the `results` folder and run the project again, with the `npm start` command.

<br>

Run the tests

```bash
cd quorum
npm test
```

<br>

Access the frontend

![Frontend](./assets/Frontend.png)

Execute the Server

```bash
cd quorum
npm run serve
```

The server will start and listen on port 3000. You can access the frontend in **http://localhost:3000**.

<br>

<p align="right"><a href="#top">Back to the top ☝</a></p>

---

<h2 id="doc">Documentation</h2>

<br>

The documentation is intended to provide a clear and detailed overview of the developed API, facilitating understanding and future maintenance.

<details><summary>CSV File Processing API Documentation</summary>
<h3>Description</h3>

This module processes CSV files related to votes, vote results, bills, and legislators. It generates two output CSV files with statistics on support and opposition for bills and support from legislators. This documentation section is about the `index.js` file.

<h3>Functionalities</h3>

<ul>
    <li><b>Reading CSV Files</b>: The module reads CSV files containing information about votes, vote results, bills and legislators;</li>
    <li><b>Data Processing</b>: Updates and organizes data on votes and legislators;</li>
    <li><b>Report Generation</b>: Creates CSV files with detailed statistics on bill support and legislator support.</li>
</ul>

<h3>Code Architecture</h3>

<h4>Imports</h4>

```javascript
const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
```

<ul>
    <li><b>fs</b>: Node.js module for manipulating files and directories;</li>
    <li><b>csv-parser</b>: Library for parsing CSV files;</li>
    <li><b>csv-writer</b>: Library for creating and writing CSV files.</li>
</ul>

<h4>CSV Writers Configuration</h4>

```javascript
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
```

<ul>
    <li><b>legislatorSupportWriter</b>: Configures the writer to generate the CSV file with information about legislators' support and opposition;</li>
    <li><b>billSupportWriter</b>: Configures the writer to generate CSV file with information about support and opposition to bills.</li>
</ul>

<h4>processCSV function</h4>

```javascript
const processCSV = (filePath, onData) => new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', onData)
        .on('end', resolve)
        .on('error', reject);
});
```

<ul>
    <li><b>filePath</b>: Path of the CSV file to be read;</li>
    <li><b>onData</b>: Callback function that processes each line of data;</li>
    <li><b>resolve</b>: Resolves the promise when processing is complete;</li>
    <li><b>reject</b>: Rejects the promise in case of error.</li>
</ul>

<h4>Data Update Functions</h4>

```javascript
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
```

<ul>
    <li><b>updateVoteData(votes, data)</b>: Updates the number of supporters and opponents of a bill based on the vote results;</li>
    <li><b>updateLegislatorData(legislatoresVotes, data)</b>: Updates the number of bills supported and opposed by a legislator based on the vote result.</li>
</ul>

<h4>Main Function processVotes</h4>

```javascript
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

    processVotes().catch(error => console.error('Error processing CSV files:', error.message));
};
```

<ul>
    <li><b>processVotes()</b>: Main function that orchestrates the processing of CSV files, updates the data and generates the output CSV files;</li>
    <li><b>processCSV(filePath, onData)</b>: Used to read and process CSV files;</li>
    <li><b>await Promise.all([...])</b>: Ensures that CSV files are written before ending the process.</li>
</ul>

<h3>CSV File Structure</h3>

`data/votes.csv`

<ul>
    <li><b>Fields</b>: id, bill_id, vote_type;</li>
    <li><b>Description</b>: Data on individual votes, indicating the bill and the type of vote (support or opposition).</li>
</ul>

`data/vote_results.csv`

<ul>
    <li><b>Fields</b>: vote_id, legislator_id, vote_type;</li>
    <li><b>Description</b>: Vote results, associating individual votes with legislators and the type of vote.</li>
</ul>

`data/bills.csv`

<ul>
    <li><b>Fields</b>: id, title, sponsor_id;</li>
    <li><b>Description</b>: Information about bills, including title and sponsor identifier.</li>
</ul>

`data/legislators.csv`

<ul>
    <li><b>Fields</b>: id, name;</li>
    <li><b>Description</b>: Information about legislators, including identifier and name.</li>
</ul>

<h3>Log Messages</h3>

<ul>
    <li><b>"CSV files processed successfully."</b>: Indicates that the processing and writing of CSV files were completed successfully;</li>
    <li><b>"Error processing CSV files:"</b>: Error message when a failure occurs in processing CSV files.</li>
</ul>

<h3>Comments</h3>

<ul>
    <li><b>Maintenance</b>: The code is structured to be easy to maintain and modify, with reusable functions and a modular approach;</li>
    <li><b>Performance</b>: Reading and writing CSV files is done asynchronously to improve performance and responsiveness.</li>
</ul>

</details>

<br>

<details><summary>Server Documentation</summary>

<h3>Overview</h3>

This Express server manages CSV file processing tasks. It includes functionality to start the processing of CSV files and list available CSV files in the `results` directory. This documentation section is about the `server.js` file.

<h3>Dependencies</h3>

<ul>
    <li><b>express</b>: Web framework for Node.js;</li>
    <li><b>child_process</b>: Node.js module to execute shell commands;</li>
    <li><b>fs</b>: Node.js module for file system operations.</li>
    <li><b>path</b>: Node.js module for handling file paths.</li>
</ul>

<h3>Endpoints</h3>

`POST /start`

<ul>
    <li><b>Description</b>: Deletes specific CSV files from the results directory and starts the processing of CSV files by executing an npm start command;</li>
    <li><b>Response</b>:</li>
        <ul>
            <li><b>200 OK</b>: If the processing starts successfully;</li>
            <li><b>500 Internal Server Error</b>: If there is an error starting the processing.</li>
        </ul>
</ul>

<h4>Example Request:</h4>

```http
    POST /start
```

<h4>Example Response:</h4>

```json
"Processing of CSV files started successfully."
```

**Note**: The following CSV files are deleted before starting the processing:

<ul>
    <li><b>legislators-support-oppose-count.csv</b></li>
    <li><b>bills-support-oppose-count.csv</b></li>
</ul>

`GET /csv-files`

<ul>
    <li><b>Description</b>: Lists all CSV files present in the results directory and returns their content;</li>
    <li><b>Response</b>:</li>
        <ul>
            <li><b>200 OK</b>: Returns a JSON array with the filenames and contents of the CSV files;</li>
            <li><b>500 Internal Server Error</b>: If there is an error listing the files.</li>
        </ul>
</ul>

<h4>Example Request:</h4>

```http
    GET /csv-files
```

<h4>Example Response:</h4>

```json
[
  {
    "filename": "legislators-support-oppose-count.csv",
    "content": "id,name,num_supported_bills,num_opposed_bills\n1,John Doe,5,2\n2,Jane Smith,3,4"
  },
  {
    "filename": "bills-support-oppose-count.csv",
    "content": "id,title,supporter_count,opposer_count,primary_sponsor\n1,Bill A,10,2,John Doe\n2,Bill B,5,7,Jane Smith"
  }
]
```
</details>

<p align="right"><a href="#top">Back to the top ☝</a></p>

---

<h2 id="nextSteps">Next Steps</h2>

<br>

Aiming to offer continuous improvement Software, considering the [MVP development](https://dev.to/kecbm/desenvolvimento-orientado-ao-mvp-minimo-produto-viavel-km4) where the analysis of customer feedback is carried out with each new delivery and adjustments to existing functionalities or development of new functionalities, below I list a series of [tasks](https://dev.to/kecbm/o-poder-das-tarefas-como-pequenas-entregas-levam-a-grandes-resultados-2of6) to be carried out in the project in the future, which forms an initial product backlog. Feel free to contribute to this list.

<br>

- [ ] Build a frontend in React;
- [ ] Refactor the API to use the MSC architecture;
- [ ] Replace CSS with Tailwind;
- [ ] Develop new application routes;
- [ ] Make the application responsive;
- [ ] Develop the dark theme;
- [ ] Develop the Not Found page;
- [ ] Deploy the application;
- [ ] Build the database for the API;
- [ ] Dockerize the frontend, backend and database;
- [ ] Develop frontend and server tests;
- [ ] Develop integration tests;
- [ ] Consume data dynamically;
- [ ] Make the analysis CSV available for download;

<br>

<p align="right"><a href="#top">Back to the top ☝</a></p>

---

<h2 id="considerations">Final considerations</h2>

<br>

<h3>Answers</h3>

<h4>1</h4>

Time complexity depends on the number of lines in the CSV files. If we have to read and process multiple files, the time it takes to do so increases with the number of lines in the largest file. We can say that the time needed is proportional to the number of lines in the largest file, which is what most affects speed. So if the largest file has n lines, the time complexity is O(n). This means that the time to process files increases linearly with the size of the largest CSV file;

<br>

<h4>2</h4>

If we need to add a new column, such as 'Co-sponsors', I would adjust the code to look for this new information. For the 'Bill voted on date' column, if it is necessary to count votes before or after a specific date, I would compare the dates. This ensures that the code counts the correct votes according to the date. In short, I would just update the code to handle new columns and do date comparisons correctly;

<br>

<h4>3</h4>

The current solution can be adapted to work with lists of legislators or bills instead of CSV files, maintaining efficiency in data processing. The API was designed to handle large volumes of data using streaming, as demonstrated in the `fs.createReadStream` snippet on line 27 of the `index.js` file.

**Data Input**: Instead of reading data from CSV files, the data would be passed directly as lists in JSON format or another appropriate data structure.

**Data Processing**: Instead of `processCSV`, we will use functions that iterate over the provided lists. We will use array methods like forEach or map to process the data.

**Data Update**: The `updateVoteData` and `updateLegislatorData` functions would remain largely the same, being called within the iteration methods to update vote and legislator counts.

**Writing of Results**: After processing, the results would be written to CSV files using `createObjectCsvWriter` as before, ensuring the data is formatted correctly for export.

<br>

<h4>4</h4>

I started developing the solution at 9 pm on 07/18/2024 and finished development at 12 pm on the same day. It took me a while to commit the resolution because I was focused on developing the challenge's README.

<br>

<p align="right"><a href="#top">Back to the top ☝</a></p>

---

<p align="center">Project developed by <a href="https://www.linkedin.com/in/kecbm/">Klecianny Melo</a> 😁</p>