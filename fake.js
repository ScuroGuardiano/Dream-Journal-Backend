const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

let dreams = [];
for(let i = 1; i <= 20; i++) {
    dreams.push({
        id: i,
        title: "Lorem Ipsum",
        content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eros erat, dapibus sit amet fringilla ut, pulvinar vitae tellus. Mauris in blandit libero, in vulputate justo. Phasellus turpis nibh, facilisis non varius vitae, blandit nec urna. Vestibulum quis suscipit mauris. Donec ipsum sem, tincidunt at sollicitudin at, viverra sed arcu. Integer ipsum dolor, tincidunt porttitor risus in, suscipit eleifend enim. Aenean leo leo, eleifend et ultricies vitae, elementum et mauris. Nunc vitae nulla ornare, lobortis ex quis, sollicitudin quam. Sed lacinia venenatis lorem.

Aliquam eu faucibus diam. Donec vel maximus orci. In et vehicula turpis, ac elementum purus. Nam a cursus nulla. Nullam quis orci at nunc egestas ullamcorper et sed dolor. Pellentesque sit amet posuere purus. Nulla elementum orci a consequat laoreet. Phasellus lobortis convallis lacinia.

Maecenas placerat blandit sagittis. In elementum aliquet libero, id ultrices dui eleifend et. Phasellus feugiat finibus libero, vitae aliquet tellus hendrerit et. Etiam semper efficitur mi. Curabitur euismod scelerisque lobortis. Pellentesque gravida, ex vitae dapibus dictum, nisi dui consequat urna, eu viverra metus nibh ut nibh. Aenean venenatis, neque at sagittis bibendum, enim lorem elementum justo, sed mattis ipsum purus sed turpis. Lorem ipsum dolor sit amet, consectetur adipiscing elit.

Donec elit erat, elementum non bibendum non, consectetur nec odio. Fusce eros felis, elementum vel consectetur egestas, dignissim ut erat. Ut lobortis tempus pellentesque. Sed ut felis dictum, elementum nisi ac, vestibulum diam. Mauris vestibulum mauris metus, quis pulvinar magna lobortis vitae. Pellentesque vulputate, felis dapibus sollicitudin tempor, dolor ex varius mi, a eleifend sapien mauris non lectus. Sed vehicula tortor quis libero tincidunt, id vehicula diam viverra. Aliquam fermentum ipsum ac tellus rhoncus, ac viverra elit maximus. Curabitur nisi lacus, pharetra finibus lorem sit amet, viverra faucibus nisi. Duis aliquam faucibus imperdiet. Pellentesque vel augue lobortis, mollis lorem vitae, bibendum nunc. Etiam fermentum tempus leo a egestas.

Suspendisse potenti. In laoreet, diam ut maximus porttitor, nulla enim suscipit risus, elementum luctus eros erat id lacus. Phasellus accumsan, magna ut pulvinar elementum, ligula dui iaculis elit, vel porttitor augue velit nec erat. Etiam auctor justo at efficitur accumsan. Integer vel gravida orci. Nullam euismod auctor nisi, non ultricies turpis lobortis vitae. Aenean nec laoreet magna, quis eleifend tellus. Proin dapibus auctor condimentum. Nunc id pellentesque tortor. Donec vel auctor ex. Sed ultricies ipsum ut semper accumsan. Aliquam sollicitudin scelerisque maximus. Sed ante risus, facilisis vitae finibus dignissim, pulvinar quis leo. Curabitur sit amet nisi tincidunt, ultrices sem in, blandit orci. Etiam nec malesuada sapien. Sed nunc erat, ultrices eget mauris accumsan, feugiat pretium risus.`,
        date: Date.UTC(2018, 5, 21 - (i + 1))
    });
}
let lastDreamId = 20;

let app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());

app.post('/api/register', (req, res) => {
    let info = `Register from ${req.ip}\n`;
    if(req.body.email && req.body.password) {
        info += `email: ${req.body.email}\n`;
        info += `password: ${req.body.password}`
        res.status(200).json({
            status: 200,
            message: "ok",
            result: {
                userEmail: req.body.email
            }
        });
    }
    else {
        info += 'Bad data!';
        res.status(400).json({
            status: 400,
            message: "Bad request"
        });
    }
    console.log(info);
})
app.post('/api/login', (req, res) => {
    let info = `Login from ${req.ip}\n`;
    if (req.body.email && req.body.password) {
        info += `email: ${req.body.email}\n`;
        info += `password: ${req.body.password}`
        res.status(200).json({
            status: 200,
            message: "ok",
            result: {
                userEmail: req.body.email
            }
        });
    }
    else {
        info += 'Bad data!';
        res.status(400).json({
            status: 400,
            message: "Bad request"
        });
    }
    console.log(info);
});
app.get('/api/dreams', (req, res) => {
    dreams.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });
    let limit = 0;
    let dreamsToReturn;
    if(req.query.limit)
        limit = req.query.limit;
    if(limit) {
        if(limit > dreams.length)
            limit = dreams.length;
        dreamsToReturn = dreams.slice(0, limit);
    }
    else {
        dreamsToReturn = dreams;
    }
    if(req.query.contentLimit) {
        dreamsToReturn = dreamsToReturn.map(dream => {
            let reducedDream = Object.assign({}, dream);
            let contentLimit = (req.query.contentLimit > reducedDream.content.length) ?
                reducedDream.content.length : req.query.contentLimit;
            reducedDream.content = reducedDream.content.slice(0, contentLimit);
            return reducedDream;
        });
    }
    res.status(200).json({
        status: 200,
        message: "ok",
        result: dreamsToReturn
    });
})
app.put('/api/dream/:id/edit', (req, res) => {
    let dream = dreams.find(el => el.id == req.params.id);
    if(!dream) {
        return res.status(404).json({
            status: 404,
            message: "Not found"
        });
    }
    if(req.body.dream)
        dream.content = req.body.dream;
    if(req.body.dreamTitle)
        dream.title = req.body.dreamTitle;
    res.status(200).json({
        status: 200,
        message: "ok",
        result: dream
    });
})
app.get('/api/dream/:id', (req, res) => {
    let dream = dreams.find(el => el.id == req.params.id);
    if(!dream) {
        return res.status(404).json({
            status: 404,
            message: "Not found"
        });
    }
    res.status(200).json({
        status: 200,
        message: "ok",
        result: dream
    });
});
app.post('/api/add-dream', (req, res) => {
    if(!req.body.dreamTitle || !req.body.dream) {
        return res.status(400).json({
            status: 400,
            message: "Bad request"
        });
    }
    let dream = {};
    dream.id = ++lastDreamId;
    dream.title = req.body.dreamTitle;
    dream.content = req.body.dream;
    dream.date = req.body.dreamDate || Date.now();
    dreams.push(dream);
    res.status(200).json({
        status: 200,
        message: "ok",
        result: dream
    });
});
app.delete('/api/delete-dream', (req, res) => {
    if(req.body.id === undefined) {
        return res.status(400).json({
            status: 400,
            message: "Bad Request"
        });
    }
    let dreamIndex = dreams.findIndex(el => el.id == req.body.id);
    if(dreamIndex === undefined) {
        return res.status(404).json({
            status: 404,
            message: "Not found lol"
        });
    }
    dreams.splice(dreamIndex, 1);
    res.status(200).json({
        status: 200,
        message: "ok"
    });
});



app.use((req, res) => {
    res.status(404).json({
        status: 404,
        message: "Not found"
    });
});

app.listen(3000, '0.0.0.0', () => {
    console.log('App is listening on port 3000');
});