## World Historical Gazetteer v3.0a

This is the repository for the v3.0-alpha version of the World Historical Gazetteer (WHG) web platform and API in development.

Everything here is changing continually.

### Contributing to software and data development

WHG is an open-source project. Please see [this document](docs/contributing_dev.md) for an overview of how to participate in the several aspects of WHG development. Specific tasks in our long TODO queue will be added as GitHub issues soon. 

### Change log

#### v3.0-alpha (initial push, 16 July 2023)
- codebase moved from worktree within v2.1 (github:whgazetteer) to private repo "whg3"

#### v2.1-beta (27 April 2022)

- New "Place Collection" feature, added to existing "Dataset Collection" capability. Place Collections can be composed of individual place records from one or more datasets (or entire datasets) related to each other in some way. Each record can be annotated to explain its inclusion, and the collection itself can include images, links, and an uploaded file.

#### v2.0.1 (1 Feb 2022)

- Added 'Teaching' section of the site. Eight lesson plans included to start, primarily high school level
- 
#### v2.0 (4 Aug 2021)

- New "Collection" feature added, with two early examples: "Dutch History" and "HGIS de las Indias"
- Revamped search functionality: option to search database as well as index; filter results by type, country, map bounding box; return to results from place pages
- Public views for datasets, collections, and individual records
- Dataset and Collection maps now using MapLibreGL, for fast rendering of large datasets
- Reliablity and error reporting for upload functions improved
- Rewritten documentation; new tutorial on LP-TSV creation and new sample lesson plan
- SSL (https) enabled
- Formation of an editorial team has begun
- Redesigned home page
- Code refactoring and cleanup

#### v1.21 (11 May 2021)

- New 'deferred' queue for reconciliation tasks
- Reconciliation review status per-record and per-task now tracked on Dataset > Browse screen
- Reconcile-to-WHG (accessioning) now finds candidate _sets_ within WHG index, not individual records
- Collections feature enabled for beta testers

#### v1.2 (5 Mar 2021)

- New local 3.5m record Wikidata index for reconciliation 
- New and improved authorization functions (register, login, password recovery)
- Add dataset collaborators in 'member' or 'co-owner' roles
- Reconciliation task progress tracking and status feedback improved

#### v1.1a (11 Jan 2021)

- Support for uploading & validating .csv, .xlsx, and .ods formats added
- Compute country codes if absent & geometry present
- Fixes: wikidata links; reporting upload errors; temporal data parsing 

#### v1.1 (10 Dec 2020)

- Reconciliation tasks now queued, and dataset owner notified by email upon completion.
- Base map replaced w/Natural Earth tiles
- Numerous minor bug fixes

#### v1.0 (27 July 2020)
- _Additional data accessioned:_ 28,000 historical records from Pleiades, Euratlas, and OWTRAD datasets.
- _APIs for access to the database and the Elasticsearch index._ Site search is against accessioned and conflated records in the index, but data uploaded to the database is discoverable as well, if flagged 'public'
- _Additional trace data added._ 70 new sets of annotations
- _Search function significantly updated._ Filters for feature class/category, spatial, temporal constraints.
- _Comprehensive Site Guide added._
- _Download datasets, before and after augmenting via reconciliation._
- _Recover password functionality._
- _Numerous GUI improvements and fixes._ Including redesign of home page.


#### beta v0.4 (2 May 2020)
- _Dataset downloads._ Options from dataset detail panel to download a) latest uploaded data file as is, b) augmented dataset (includes any geometries and/or concordance 'links' added during reconciliation review step).

- _Draft public API._ Parameters include q=, dataset=, ccodes=. E.g. `/api/?q=abydos&dataset=black&ccodes=eg`

- _Misc minor UI fixes_.

#### beta v0.3 (25 Feb 2020)
- _Core data significantly expanded._ Added ~1.5 million place records from Getty Thesaurus of Geographic Names (TGN), and ~1,000 large cities from GeoNames to WHG index. Contributions from historical sources will, in addition to adding novel entries, add "temporal depth" to these ahistorical data.

- _Dataset updates._ Dataset owners are now able to perform updates by uploading new data files. Analysis of the changes to be made (add, remove, replace) is performed automatically, and presented for review before performing them. _NOTE: available only for LP-TSV format currently. Linked Places format will follow soon, as will enhancements to file management._


- _"Collaborator" role._ Dataset owners can specify any number of registered users as collaborators, able to view non-public data and assist in review of reconciliation results; effectively, dataset project teams.

- _Undo last reconciliation match._ When moving quickly through prospective matches in the reconciliation review task, it is possible to inadvertently save a match; we've added a single step undo of the last action.

- _Dataset management functions consolidated._ Single page with tabs for Metadata, Browse, Reconciliation, Collaboration functionality.

### Software libraries and packages

- Django 4.1.7
- Python 3.10.7
- PostgreSQL 15
- Elasticsearch 8.6.2
- Nginx 1.22.0
- Gunicorn 20.1.0
- Celery 4.4.7
- Bootstrap 5
- JQuery 3.6.3
- maplibre-gl 1.15.2
- mapbox-gl-js 2.14.1
- Leaflet 1.3.1

