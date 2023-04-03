require('dotenv').config()
const express = require('express')
const cors = require('cors')
const Contact = require('./models/contact')
var morgan = require('morgan')
const app = express()

morgan.token('body', function getResponse (req) {
    return JSON.stringify(req.body)
  })

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
  
    next(error)
}

app.use(express.static('build'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(cors())

app.get('/info', (request, response) => {
    Contact.countDocuments({}).then(count => {
        const date = new Date();
        response.writeHead(200, { 'Content-Type': 'text/plain' });
        response.end(`Phonebook has info for ${count} people\n${date}`)
    })
    .catch(error => {
        console.error(error);
        response.status(500).send('Error retrieving contacts');
    });
})

app.post('/api/contacts', (request, response, next) => {
    const body = request.body
    
    Contact.findOne({ name: body.name })
    .then(existingContact => {
        if (existingContact) {
            const id = existingContact._id;

            app.put(`/api/contacts/${id}`, (request, response, next) => {
                const body = request.body;

                const contact = {
                    name: body.name,
                    number: body.number,
                };

                Contact.findByIdAndUpdate(id, contact, { new: true })
                    .then(updatedContact => {
                        response.json(updatedContact);
                    })
                    .catch(error => next(error));
            });

            response.redirect(`PUT /api/contacts/${id}`);
        } else {
            const contact = new Contact({
                name: body.name,
                number: body.number,
            });

            contact.save().then(savedContact => {
                response.json(savedContact)
            })
            .catch(error => next(error));
        }
    })
    .catch(error => next(error));
});

app.put('/api/contacts/:id', (request, response, next) => {
    const body = request.body;

    const contact = {
        name: body.name,
        number: body.number,
    };

    Contact.findByIdAndUpdate(request.params.id, contact, { new: true })
        .then(updatedContact => {
            response.json(updatedContact);
        })
        .catch(error => next(error));
});
  
app.get('/api/contacts', (request, response) => {
    Contact.find({}).then(contacts => {
        response.json(contacts)
    })
})

app.get('/api/contacts/:id', (request, response, next) => {
    Contact.findById(request.params.id).then(contact => {
        if (contact) {
            response.json(contact)
        } else {
            response.status(404).end()
        }
    })
    .catch(error => next(error))
})

app.delete('/api/contacts/:id', (request, response, next) => {
    Contact.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})