import * as migration_20260405_125727 from './20260405_125727';
import * as migration_20260406_025519 from './20260406_025519';
import * as migration_20260406_084635 from './20260406_084635';
import * as migration_20260406_110922 from './20260406_110922';
import * as migration_20260406_112753 from './20260406_112753';
import * as migration_20260406_160000 from './20260406_160000';
import * as migration_20260407_sticky_header from './20260407_sticky_header';
import * as migration_20260408_104702_fix_media_urls from './20260408_104702_fix_media_urls';
import * as migration_20260410_063849 from './20260410_063849';
import * as migration_20260410_094304_newsetup from './20260410_094304_newsetup';
import * as migration_20260410_122248_new from './20260410_122248_new';
import * as migration_20260410_123009_newsetups from './20260410_123009_newsetups';
import * as migration_20260410_123643_newupdate1 from './20260410_123643_newupdate1';
import * as migration_20260410_133131 from './20260410_133131';
import * as migration_20260410_133740_newsetupss from './20260410_133740_newsetupss';
import * as migration_20260410_154600_newsetupsss from './20260410_154600_newsetupsss';

export const migrations = [
  {
    up: migration_20260405_125727.up,
    down: migration_20260405_125727.down,
    name: '20260405_125727',
  },
  {
    up: migration_20260406_025519.up,
    down: migration_20260406_025519.down,
    name: '20260406_025519',
  },
  {
    up: migration_20260406_084635.up,
    down: migration_20260406_084635.down,
    name: '20260406_084635',
  },
  {
    up: migration_20260406_110922.up,
    down: migration_20260406_110922.down,
    name: '20260406_110922',
  },
  {
    up: migration_20260406_112753.up,
    down: migration_20260406_112753.down,
    name: '20260406_112753',
  },
  {
    up: migration_20260406_160000.up,
    down: migration_20260406_160000.down,
    name: '20260406_160000',
  },
  {
    up: migration_20260407_sticky_header.up,
    down: migration_20260407_sticky_header.down,
    name: '20260407_sticky_header',
  },
  {
    up: migration_20260408_104702_fix_media_urls.up,
    down: migration_20260408_104702_fix_media_urls.down,
    name: '20260408_104702_fix_media_urls',
  },
  {
    up: migration_20260410_063849.up,
    down: migration_20260410_063849.down,
    name: '20260410_063849',
  },
  {
    up: migration_20260410_094304_newsetup.up,
    down: migration_20260410_094304_newsetup.down,
    name: '20260410_094304_newsetup',
  },
  {
    up: migration_20260410_122248_new.up,
    down: migration_20260410_122248_new.down,
    name: '20260410_122248_new',
  },
  {
    up: migration_20260410_123009_newsetups.up,
    down: migration_20260410_123009_newsetups.down,
    name: '20260410_123009_newsetups',
  },
  {
    up: migration_20260410_123643_newupdate1.up,
    down: migration_20260410_123643_newupdate1.down,
    name: '20260410_123643_newupdate1',
  },
  {
    up: migration_20260410_133131.up,
    down: migration_20260410_133131.down,
    name: '20260410_133131',
  },
  {
    up: migration_20260410_133740_newsetupss.up,
    down: migration_20260410_133740_newsetupss.down,
    name: '20260410_133740_newsetupss',
  },
  {
    up: migration_20260410_154600_newsetupsss.up,
    down: migration_20260410_154600_newsetupsss.down,
    name: '20260410_154600_newsetupsss'
  },
];
