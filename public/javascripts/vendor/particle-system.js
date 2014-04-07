/*jslint browser: true, white: true, plusplus: true */
/*global Random */
function particleSystem(spec, graphics, options) {
	'use strict';
	var that = spec,
		nextName = 1;	// unique identifier for the next particle
		that.particles = {},	// Set of all active particles

	//------------------------------------------------------------------
	//
	// This creates one new particle
	//
	//------------------------------------------------------------------
	that.create = function() {
		var p = {
				image: spec.image,
				size: options? options.size : Random.nextGaussian(20, 10),
				center: {x: spec.center.x, y: spec.center.y},
				direction: spec.direction? spec.direction : options? options.direction : Random.nextCircleVector(),//,
				speed: options? Random.nextGaussian(spec.speed.mean + 300, 0) : Random.nextGaussian(spec.speed.mean, spec.speed.stdev - 5), // pixels per second
				rotation: 0,
				lifetime: options? Random.nextGaussian(spec.lifetime.mean -0.9, spec.lifetime.stdev - 0.15) : Random.nextGaussian(spec.lifetime.mean, spec.lifetime.stdev),	// How long the particle should live, in seconds

				alive: 0	// How long the particle has been alive, in seconds
			};
		console.log("lifetime mean: "+spec.lifetime.mean+" stdev: "+spec.lifetime.stdev);
		//
		// Ensure we have a valid size - gaussian numbers can be negative
		p.size = Math.max(1, p.size);
		//
		// Same thing with lifetime
		p.lifetime = Math.max(0.01, p.lifetime);
		//
		// Assign a unique name to each particle
		that.particles[nextName++] = p;
	};
	
	//------------------------------------------------------------------
	//
	// Update the state of all particles.  This includes remove any that 
	// have exceeded their lifetime.
	//
	//------------------------------------------------------------------
	that.update = function(elapsedTime) {
		var removeMe = [],
			value,
			particle;
		
		for (value in that.particles) {
			if (that.particles.hasOwnProperty(value)) {
				particle = that.particles[value];
				//
				// Update how long it has been alive
				particle.alive += elapsedTime;
				
				//
				// Update its position
				particle.center.x += (elapsedTime * particle.speed * particle.direction.x);
				particle.center.y += (elapsedTime * particle.speed * particle.direction.y);
				
				//
				// Rotate proportional to its speed
				particle.rotation += particle.speed / 500;
				
				//
				// If the lifetime has expired, identify it for removal
				if (particle.alive > particle.lifetime) {
					removeMe.push(value);
				}
			}
		}


		//
		// Remove all of the expired particles
		for (particle = 0; particle < removeMe.length; particle++) {
			delete that.particles[removeMe[particle]];
		}
		removeMe.length = 0;
	};
	
	//------------------------------------------------------------------
	//
	// Render all particles
	//
	//------------------------------------------------------------------
	that.render = function() {
		var value,
			particle;
		
		for (value in that.particles) {
			if (that.particles.hasOwnProperty(value)) {
				particle = that.particles[value];
				graphics.drawImage(particle);
			}
		}
	};
	
	return that;
}
