import request from 'supertest';
import {expect} from 'chai';
import app from '../../src/app.js';
import User from '../../src/models/userModel.js';
import sinon from 'sinon';
import jwt from 'jsonwebtoken';
import { mockJWTtoken, mockUser1 } from '../__mocks__/userMocks.js';
import { afterEach, before } from 'node:test';

describe('GET /api/v1/users/signup', () => {
  let createUserStub;
  let signTokenStub;
    // Set up a stub for the User.create method
    before(() => {
      createUserStub = sinon.stub(User, 'create');
      signTokenStub = sinon.stub(jwt, 'sign').returns(mockJWTtoken);
      process.env.NODE_ENV = 'development';
     
    });
    afterEach(() => {
      createUserStub.restore();
      signTokenStub.restore();
    });
  it('should successfully sign up a user and return user data and token', async function() {
    createUserStub.resolves({
      _id: 1,
      ...mockUser1,
    });
    const res = await request(app)
      .post('/api/v1/users/signup')
      .send(mockUser1).expect("Content-Type", /json/);
    expect(res.body.status).to.equal('success');
    expect(res.body.data.user._id).to.equal(1);
    expect(res.body.data.user.name).to.equal(mockUser1.name);
    expect(res.body.data.user.email).to.equal(mockUser1.email);
    expect(res.body.data.user.role).to.equal(mockUser1.role);
  });
  it('should return error if password and confirm password do not match', async function () {
    const invalidUser = { ...mockUser1, passwordConfirm: 'differentpassword' };
    createUserStub.rejects({
      error:{
        message: "password and confirm password do not match"
      }
      });
    const res = await request(app)
      .post('/api/v1/users/signup')
      .send(invalidUser)
      .expect('Content-Type', /json/);
      expect(res.status).to.equal(500);
      expect(res.body.status).to.equal('error');
      expect(res.body.error.error.message).to.equal('password and confirm password do not match');
  });

  it('should return error if a duplicate user is found', async function () {
    createUserStub.rejects({ code: 11000 });  // MongoDB duplicate key error code

    const res = await request(app)
      .post('/api/v1/users/signup')
      .send(mockUser1)
      .expect('Content-Type', /json/);
    expect(res.status).to.equal(500);
    expect(res.body.status).to.equal('error'); 
    expect(res.body.error.code).to.equal(11000); 
    });

});