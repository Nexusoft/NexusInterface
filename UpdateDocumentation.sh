#!/bin/bash
echo ""
echo "Building MD Documentation"
echo ""
documentation build app/index.js -f md -o docs/Documentation.md
echo ""
echo "Building HTML Documentation"
echo ""
documentation build app/index.js -f html -o docs