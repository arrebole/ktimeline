import { volume } from './volume';
import { movingAverage } from './movingAverage';
import { registerIndicator } from 'klinecharts';

registerIndicator(movingAverage);
registerIndicator(volume);