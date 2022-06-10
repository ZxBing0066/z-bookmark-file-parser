import { readFileSync } from 'fs';

import parse from '../index';

const content = readFileSync('./bookmarks.html', 'utf8');

const result = parse(content);
