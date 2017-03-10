/*
  Scaffolds a penplot canvas and render loop.
 */

import 'babel-polyfill'; 
import penplot from 'penplot';

import * as opts from process.env.PENPLOT_ENTRY;
import entry from process.env.PENPLOT_ENTRY;

penplot(entry, Object.assign({}, opts));
