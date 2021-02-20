var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");

router.get("/", function(req, res) {
	//res.render("campgrounds", {campgrounds:campgrounds});
	Campground.find({},function(err, allCampgrounds) {
		if (err) {
			console.log(err);
		}
		else {
			res.render("campgrounds/index", {campgrounds:allCampgrounds});
		}
	});
});

//Create campground
router.get("/new", isLoggedIn, function(req, res){
   res.render("campgrounds/new"); 
});


//Show campground
router.get("/:id", function(req, res) {
	 Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
	 	if (err) {
			console.log(err);
		}
		else {
			res.render("campgrounds/show", {campground:foundCampground});
		}
	 });
});


router.post("/", function(req, res) {
	var name = req.body.name;
	var image = req.body.image;
	var desc = req.body.description;
	var author = {
	    id: req.user._id,
	    username: req.user.username
	}
	var newCampground = {name: name, 
						image: image, 
						description: desc,
						author: author};
	Campground.create(newCampground, function(err, newlyCreated) {
		if (err) {
			console.log(err);
		}
		else {
			res.redirect("/campgrounds");
		}
	})
});

//Edit campground
router.get("/:id/edit", checkCampgroungOwnership, function(req, res) {
	Campground.findById(req.params.id, function(err,foundCampground) {
		if (err) {
			console.log(err);
			res.redirect("/campgrounds");
		}
		else {
			res.render("campgrounds/edit", {campground: foundCampground});
		}
	});
});


router.put("/:id", checkCampgroungOwnership, function(req, res) {
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground) {
		if (err) {
			console.log(err);
			res.redirect("/campground");
		}
		else {
			res.redirect("/campgrounds/" + req.params.id);
		}
	})
});

//Delete campground
router.delete("/:id", checkCampgroungOwnership, function(req, res) {
	Campground.findByIdAndRemove(req.params.id, function(err) {
		if (err) {
			console.log(err);
			res.redirect("/campground");
		}
		else {
			res.redirect("/campgrounds");
		}
	})
});


function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	else {
		res.redirect("/login"); 
	}
}

function checkCampgroungOwnership(req, res, next) {
	if(req.isAuthenticated()) {
		Campground.findById(req.params.id, function(err,foundCampground) {
			if (err) {
				console.log(err);
				res.redirect("back");
			}
			else {
				if (foundCampground.author.id.equals(req.user._id)) {
					next();
				}
				else {
					res.redirect("back");
				}
			}
		});
	}
	else {
		res.redirect("back");
	}
}

module.exports = router;