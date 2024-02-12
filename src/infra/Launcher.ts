#!/usr/bin/env node
import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { Aen } from './stacks/InfraStack';

const app = new App();
new Aen(app, 'Aen');