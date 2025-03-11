let mongoose = require("mongoose");
let server = require("./app");
let chai = require("chai");
let chaiHttp = require("chai-http");

// Assertion
chai.should();
chai.use(chaiHttp);

describe('Planets API Suite', () => {

    // Cleanup database before each test case
    beforeEach(async () => {
        // Clear the database or relevant collections
        await mongoose.connection.db.collection('planets').deleteMany({});
        
        // Insert planet data
        await mongoose.connection.db.collection('planets').insertMany([
            { id: 1, name: 'Mercury' },
            { id: 2, name: 'Venus' },
            { id: 3, name: 'Earth' },
            { id: 4, name: 'Mars' },
            { id: 5, name: 'Jupiter' },
            { id: 6, name: 'Saturn' },
            { id: 7, name: 'Uranus' },
            { id: 8, name: 'Neptune' }
        ]);
    });

    describe('Fetching Planet Details', () => {
        it('it should fetch a planet named Mercury', (done) => {
            let payload = { id: 1 };
            chai.request(server)
                .post('/planet')
                .send(payload)
                .end((err, res) => {
                    if (err) done(err);
                    res.should.have.status(200);
                    res.body.should.have.property('id').eql(1);
                    res.body.should.have.property('name').eql('Mercury');
                    done();
                });
        });

        it('it should fetch a planet named Venus', (done) => {
            let payload = { id: 2 };
            chai.request(server)
                .post('/planet')
                .send(payload)
                .end((err, res) => {
                    if (err) done(err);
                    res.should.have.status(200);
                    res.body.should.have.property('id').eql(2);
                    res.body.should.have.property('name').eql('Venus');
                    done();
                });
        });

        it('it should fetch a planet named Earth', (done) => {
            let payload = { id: 3 };
            chai.request(server)
                .post('/planet')
                .send(payload)
                .end((err, res) => {
                    if (err) done(err);
                    res.should.have.status(200);
                    res.body.should.have.property('id').eql(3);
                    res.body.should.have.property('name').eql('Earth');
                    done();
                });
        });

        it('it should fetch a planet named Mars', (done) => {
            let payload = { id: 4 };
            chai.request(server)
                .post('/planet')
                .send(payload)
                .end((err, res) => {
                    if (err) done(err);
                    res.should.have.status(200);
                    res.body.should.have.property('id').eql(4);
                    res.body.should.have.property('name').eql('Mars');
                    done();
                });
        });

        it('it should fetch a planet named Jupiter', (done) => {
            let payload = { id: 5 };
            chai.request(server)
                .post('/planet')
                .send(payload)
                .end((err, res) => {
                    if (err) done(err);
                    res.should.have.status(200);
                    res.body.should.have.property('id').eql(5);
                    res.body.should.have.property('name').eql('Jupiter');
                    done();
                });
        });

        it('it should fetch a planet named Saturn', (done) => {
            let payload = { id: 6 };
            chai.request(server)
                .post('/planet')
                .send(payload)
                .end((err, res) => {
                    if (err) done(err);
                    res.should.have.status(200);
                    res.body.should.have.property('id').eql(6);
                    res.body.should.have.property('name').eql('Saturn');
                    done();
                });
        });

        it('it should fetch a planet named Uranus', (done) => {
            let payload = { id: 7 };
            chai.request(server)
                .post('/planet')
                .send(payload)
                .end((err, res) => {
                    if (err) done(err);
                    res.should.have.status(200);
                    res.body.should.have.property('id').eql(7);
                    res.body.should.have.property('name').eql('Uranus');
                    done();
                });
        });

        it('it should fetch a planet named Neptune', (done) => {
            let payload = { id: 8 };
            chai.request(server)
                .post('/planet')
                .send(payload)
                .end((err, res) => {
                    if (err) done(err);
                    res.should.have.status(200);
                    res.body.should.have.property('id').eql(8);
                    res.body.should.have.property('name').eql('Neptune');
                    done();
                });
        });
    });
});

// Use below test case to achieve coverage
describe('Testing Other Endpoints', () => {

    describe('it should fetch OS Details', () => {
        it('it should fetch OS details', (done) => {
            chai.request(server)
                .get('/os')
                .end((err, res) => {
                    if (err) done(err);
                    res.should.have.status(200);
                    done();
                });
        });
    });

    describe('it should fetch Live Status', () => {
        it('it checks Liveness endpoint', (done) => {
            chai.request(server)
                .get('/live')
                .end((err, res) => {
                    if (err) done(err);
                    res.should.have.status(200);
                    res.body.should.have.property('status').eql('live');
                    done();
                });
        });
    });

    describe('it should fetch Ready Status', () => {
        it('it checks Readiness endpoint', (done) => {
            chai.request(server)
                .get('/ready')
                .end((err, res) => {
                    if (err) done(err);
                    res.should.have.status(200);
                    res.body.should.have.property('status').eql('ready');
                    done();
                });
        });
    });

});
