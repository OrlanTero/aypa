// Enable CORS
app.use(cors());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Init Middleware
app.use(express.json({ extended: false })); 