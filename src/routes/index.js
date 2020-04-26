const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Prueba con neo4j');
});

module.exports = router;
