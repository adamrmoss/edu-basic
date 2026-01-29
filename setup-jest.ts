import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';
import 'jest-canvas-mock';

setupZoneTestEnv();

beforeAll(() =>
{
    jest.spyOn(console, 'log').mockImplementation(() => { });
    jest.spyOn(console, 'info').mockImplementation(() => { });
});
