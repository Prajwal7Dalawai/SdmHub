const mongoose = require('mongoose');

const auth_docs = [
    {
      id: '2SD22CS058',
      name: 'Prajwalagouda S Dalawai',
    },
    {
      id: '2SD22CS058',
      name: 'Prajwal Dalawai',
    },
    {
      id: '2SD23CS408',
      name: 'Sushanth Dharwad',
    },
    {
      id: '2SD23CS405',
      name: 'Nanda G',
    },
    {
      id: '2SD23CS404',
      name: 'Kiran B',
    },
    {
      id: '2SD23CS403',
      name: 'Gousiya',
    },
    {
      id: '2SD23CS401',
      name: 'Darshan Halligudi',
    },
    {
      id: '2SD23CS133',
      name: 'Darshan Hoolikatti',
    },
    {
      id: '2SD22CS131',
      name: 'Yogesh Patil',
    },
    {
      id: '2SD22CS128',
      name: 'Yaseen K',
    },
    {
      id: '2SD22CS126',
      name: 'Vishwanath K',
    },
    {
      id: '2SD22CS001',
      name: 'Abdul',
    },
    {
      id: '2SD22CS002',
      name: 'Abhilash Jambagi',
    },
    {
      id: '2SD22CS003',
      name: 'Abhishek B',
    },
    {
      id: '2SD22CS005',
      name: 'Abhishek Ks',
    },
    {
      id: '2SD22CS006',
      name: 'Abhishek Todurkar',
    },
    {
      id: '2SD22CS008',
      name: 'Akhil A I',
    },
    {
      id: '2SD22CS010',
      name: 'Anantnag Kumbar',
    }
];

const auth_docs_schema = new mongoose.Schema({
    id: {type: String, required: true},
    name: {type: String, required: true},
});

const auth_docs_model = mongoose.model('auth_docs', auth_docs_schema);

async function connectToDatabase() {
    try {
        await mongoose.connect('mongodb://localhost:27017/SdmHub');
        console.log('Connected to MongoDB successfully');
        return true;
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        return false;
    }
}

async function insertData() {
    try {
        // Check if data already exists
        const count = await auth_docs_model.countDocuments();
        if (count > 0) {
            console.log('Data already exists in the database');
            return;
        }

        // Insert data with error handling for duplicates
        const result = await auth_docs_model.insertMany(auth_docs, { ordered: false });
        console.log('Data inserted successfully');
    } catch (error) {
        if (error.writeErrors) {
            console.log('Some documents were not inserted due to duplicates');
        } else {
            console.error('Error inserting data:', error);
        }
    }
}

// Export the model and functions
module.exports = {
    auth_docs_model,
    connectToDatabase,
    insertData
};