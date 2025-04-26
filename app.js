const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Blog = require('./models/blog');
const methodOverride = require('method-override');


// express app
const app = express();

// connect to mongodb & listen for requests
const dbURI = "mongodb+srv://thordzhub:test1234@blogs.pzyodux.mongodb.net/?retryWrites=true&w=majority&appName=blogs";

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(result => app.listen(5000))
  .catch(err => console.log(err));

// register view engine
app.set('view engine', 'ejs');

// middleware & static files
app.use(express.static('public'));
app.use(express.urlencoded( {extended: true} ));
app.use(morgan('dev'));
app.use((req, res, next) => {
  res.locals.path = req.path;
  next();
});
app.use(methodOverride('_method'));

// mongoose & mongo tests
app.get('/add-blog', (req, res) => {
  const blog = new Blog({
    title: 'new blog',
    snippet: 'about my new blog',
    body: 'more about my new blog'
  })

  blog.save()
    .then(result => {
      res.send(result);
    })
    .catch(err => {
      console.log(err);
    });
});

app.get('/all-blogs', (req, res) => {
  Blog.find()
    .then(result => {
      res.send(result);
    })
    .catch(err => {
      console.log(err);
    });
});

app.get('/single-blog', (req, res) => {
  Blog.findById('5ea99b49b8531f40c0fde689')
    .then(result => {
      res.send(result);
    })
    .catch(err => {
      console.log(err);
    });
});

app.get('/', (req, res) => {
  res.redirect('/blogs');
});

app.get('/about', (req, res) => {
  res.render('about', { title: 'About' });
});

// blog routes
app.get('/blogs/create', (req, res) => {
  res.render('create', { title: 'Create a new blog' });
});

app.get('/blogs', (req, res) => {
  Blog.find().sort({ createdAt: -1 })
    .then(result => {
      res.render('index', { blogs: result, title: 'All blogs' });
    })
    .catch(err => {
      console.log(err);
    });
});

app.get('/blogs/:id/edit', (req, res) => {
  const id = req.params.id;
  Blog.findById(id)
    .then(result => {
      res.render('edit', { blog: result, title: 'Edit Blog' });
    })
    .catch(err => {
      console.log(err);
      res.status(404).render('404', { title: 'Blog Not Found' });
    });
});


// Controllers

app.post('/blogs', (req, res) => {
  const blog = new Blog(req.body);
  blog.save()
    .then((result) => {
      res.redirect('/blogs')
    })
    .catch((err) => {
      console.log(err)
    })
})

app.put('/blogs/:id', (req, res) => {
  const id = req.params.id;
  Blog.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
    .then(result => {
      res.redirect(`/blogs/${id}`);
    })
    .catch(err => {
      console.log(err);
    });
});

app.delete('/blogs/:id', (req, res) => {
  const id = req.params.id;
  Blog.findByIdAndDelete(id)
    .then(result => {
      res.json({redirect: '/blogs'})
    })
    .catch(err => {
      console.log(err);
    })
})

app.get('/blogs/:id' , (req, res) => {
  const id = req.params.id;
  Blog.findById(id)
    .then(result => {
      res.render('details', {blog: result, title: 'Blog Details'})
    })
    .catch((err) => {
      console.log(err)
    })
})

// 404 page
app.use((req, res) => {
  res.status(404).render('404', { title: '404' });
});