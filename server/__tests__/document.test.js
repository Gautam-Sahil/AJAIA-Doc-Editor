const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const documentRoutes = require('../routes/documentRoutes');

// Spin up an isolated, structural Express instance strictly for route verification
const app = express();
app.use(express.json());
app.use('/api/documents', documentRoutes);

describe('Backend Document Layer Security Enforcement Matrix', () => {
  
  // Test Guard 1: Verify route protection checks
  it('should explicitly reject incoming fetch operations with HTTP 401 if a bearer token is absent', async () => {
    const res = await request(app)
      .get('/api/documents')
      .send();

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message');
  });

  // Test Guard 2: Verify modification isolation checks
  it('should explicitly block structural update transmissions with HTTP 401 if a bearer token is absent', async () => {
    const mockDocId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .put(`/api/documents/${mockDocId}`)
      .send({
        title: 'Malicious Overwrite Stream Attempt',
        content: '<p>Intercepted Payload</p>'
      });

    expect(res.statusCode).toEqual(401);
  });
});