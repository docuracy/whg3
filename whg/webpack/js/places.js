// /whg/webpack/places.js

import '/webpack/node_modules/@maptiler/sdk/dist/maptiler-sdk.umd.min.js';
import '/webpack/node_modules/@maptiler/sdk/dist/maptiler-sdk.css';
import datasetLayers from './mapLayerStyles';
import { attributionString, geomsGeoJSON } from './utilities';
import { bbox } from './6.5.0_turf.min.js';
import { CustomAttributionControl } from './customMapControls';

import '../css/places.css';

let style_code;
if (mapParameters.styleFilter.length == 0) {
	style_code = ['DATAVIZ', 'DEFAULT']
} else {
	style_code = mapParameters.styleFilter[0].split(".");
}

maptilersdk.config.apiKey = mapParameters.mapTilerKey;
let mappy = new maptilersdk.Map({
	container: mapParameters.container,
	center: mapParameters.center,
	zoom: mapParameters.zoom,
	minZoom: mapParameters.minZoom,
	maxZoom: mapParameters.maxZoom,
	style: maptilersdk.MapStyle[style_code[0]][style_code[1]],
	attributionControl: false,
	geolocateControl: false,
	navigationControl: false,
	userProperties: true
});

function waitMapLoad() {
    return new Promise((resolve) => {
        mappy.on('load', () => {
            console.log('Map loaded.');
            const style = mappy.getStyle();
            style.layers.forEach(layer => {
                if (layer.id.includes('label')) {
                    mappy.setLayoutProperty(layer.id, 'visibility', 'none');
                }
            });
            
            const pgeom = JSON.parse($('#pgeom script').text());
            const featureCollection = geomsGeoJSON([{geom: pgeom}]);
            console.log(featureCollection);
		    mappy.addSource('places', {
				'type': 'geojson',
				'data': featureCollection,
				'attribution': attributionString(),
			});
		    datasetLayers.forEach(function(layer) {
				mappy.addLayer(layer);
			});
			mappy.fitBounds(bbox(featureCollection), {
		        padding: 30,
		        duration: 1000,
		    });
			
			mappy.addControl(new CustomAttributionControl({
				compact: true,
		    	autoClose: mapParameters.controls.attribution.open === false,
			}), 'bottom-right');
            
            resolve();
        });
    });
}

function waitDocumentReady() {
    return new Promise((resolve) => {
        $(document).ready(() => resolve());
    });
}

Promise.all([waitMapLoad(), waitDocumentReady()])
    .then(() => {
 
    })
    .catch(error => console.error("An error occurred:", error));

// leaflet map into modal
function modalMap() {
	mappo = L.map('mapdiv').setView([0, 0], 2);
	var token_mb = '{{ mbtoken }}'

	mbstyle_url = 'https://api.mapbox.com/styles/v1/{id}/tiles/256/{z}/{x}/{y}?access_token={token}';

	osm = L.tileLayer(mbstyle_url, {
		id: 'mapbox/light-v10',
		token: token_mb
	}).addTo(mappo)

	geom = {
		"type": "FeatureCollecton",
		"features": []
	}

	// script includes geometry from calling portal page 
	// filter to this pid
	window.pgeoms = $('script').filter(function() {
		return this.id == '{{ object.id }}' &&
			this.text != '"null"' &&
			this.text.includes('coordinates');
	});

	if (pgeoms.length > 0) {
		for (i = 0; i < pgeoms.length; i++) {
			let g = JSON.parse(pgeoms[i].text) 
				//console.log(JSON.parse(pgeoms[i].text))
				g['properties'] = {
					"id": pgeoms[i].id
				}
			geom['features'].push(g)
		}
		layers = []
		features = L.geoJSON(geom, {
			onEachFeature: function(feature, layer) {
				f = feature;
				l = layer;
				layers.push(layer)
				//console.log('feature',f)
				if (f.type != 'Point') {
					console.log('f.type', f.type)
					layer.setStyle(styles[f.type].default)
				}
			}
		}).addTo(mappo);
	}
	zoomTo(layers[0])
}

//renderMap(geom)

function zoomTo(lyr) {
	//console.log('zoomTo()',lyr)
	//l = idToFeature[pid]
	ftype = lyr.feature.geometry.type
	//console.log('zoomTo() pid, ftype',pid, ftype)
	if (ftype == 'Point') {
		mappo.setView(lyr._latlng, 7)
	} else {
		mappo.fitBounds(lyr.getBounds(), {
			padding: [100, 100]
		})
	}
}

$("[rel='tooltip']").tooltip();

var clip_geom = new ClipboardJS('#a_clipgeom');
clip_geom.on('success', function(e) {
	e.clearSelection();
	$("#a_clipgeom").tooltip('hide')
		.attr('data-original-title', 'copied!')
		.tooltip('show');
});
// activate all tooltips

$(function() {
	//area_type = 'ccodes' // default
	$(".textarea").each(function(index) {
		if (["None", "null"].includes($(this).val())) {
			$(this).val('')
		}
	});
	$("#id_geojson").attr("placeholder", "generated from country codes")

	$(".a_more").click(function(e) {
		clicked = $(this)
		clicked.hide()
		clicked.parent().find("#dots").hide()
		clicked.next().removeClass('hidden')
		//clicked.css("display","contents")
		// $(this).hide()
		console.log('clicked', clicked)
		//clicked.removeClass('hidden')
	})

	// temporal data from template json_script
	window.pminmax = $('script').filter(function() {
		return this.id == '{{ object.id }}' &&
			this.text &&
			this.text.includes('mm');
	});
	window.pts = $('script').filter(function() {
		return this.id == '{{ object.id }}' &&
			this.text &&
			this.text.includes('ts');
	});

	// don't try to make a histogram if no temporal data
	if (pminmax.length > 0 && pts.length > 0) {
		allts = JSON.parse(pts[0].text)['ts']
		minmax = JSON.parse(pminmax[0].text)['mm']
		console.log('allts', allts)
		console.log('minmax', minmax)

		// feed to tvis_summary()
		histogram_data(allts, minmax)
	} else {
		$("#place_temporal").hide()
	}

	// generate, populate map
	//modalMap()

}) // end onload()

// helpers for histogram_data()
function range(start, stop, step) {
	var a = [start],
		b = start;
	while (b < stop) {
		a.push(b += step || 1);
	}
	return a;
}

function intersects(a, b) {
	min = (a[0] < b[0] ? a : b)
	max = (min == a ? b : a)
	return !(min[1] < max[1])
}

// generate temporal data -> histogram()
function histogram_data(intervals, minmax) {
	step = Number(((minmax[1] - minmax[0]) / 200))
	bins = range(minmax[0], minmax[1], step)
	hist_array = Array.apply(null, Array(bins.length)).map(Number.prototype.valueOf, 0);
	labels = bins.map(function(d) {
		return Math.round(d)
	})
	for (b = 0; b < bins.length; b++) {
		bin = Array(bins[b], bins[b + 1])
		for (i in intervals) {
			if (intersects(bin, intervals[i])) {
				hist_array[b] += 1
			}
		}
	}
	data = hist_array.map(function(d, i) {
		return {
			"bin": labels[i],
			"count": d
		}
	})

	// visualize it
	histogram(data, labels)

}

function histogram(data, labels) {
	// exit if no data 
	if (data[0].bin == "Infinity") {
		$("#histogram").html('<i>None yet</i>');
		return;
	}
	data = data.slice(0, 200)
	curwidth = $("#histogram").width()

	var margin = {
			top: 0,
			right: 10,
			bottom: 0,
			left: 10
		},
		width = 400,
		height = 30,
		padding_h = 20,
		padding_w = 30;

	// set the ranges
	window.xScale = d3.scaleLinear()
		.range([0, width])
	window.yScale = d3.scaleLinear()
		.range([height, 0]);

	xScale.domain(minmax);
	yScale.domain([0, d3.max(data, function(d) {
		return d.count;
	})]);

	// TODO: responsive scaling of svg width
	window.svg_hist = d3.select("#histogram").append("svg")
		.attr("width", '100%')
		.attr("height", height + padding_h)

		.attr('viewBox', '0 0 ' + Math.min(width, height + padding_h) + ' ' + Math.min(width, height + padding_h))
		.attr('preserveAspectRatio', 'xMinYMin')

		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")")

	window.axisB = d3.axisBottom(xScale)
		.tickValues(labels.filter(function(d, i) {
			return !(i % 20)
		}))
		.tickFormat(d3.format("d"));

	var axisL = d3.axisLeft(yScale)

	svg_hist.selectAll(".bar")
		.data(data)
		.enter().append("rect")
		.attr("class", "bar")
		.attr("x", function(d) {
			return xScale(d.bin);
		})
		//.attr("width", function(d) { return xScale(d.x1) - xScale(d.x0) -1 ; })
		.attr("width", 2)
		.attr("y", function(d) {
			return yScale(d.count);
		})
		.attr("height", function(d) {
			return height - yScale(d.count);
		});

	var xAxis = svg_hist.append("g")
		.attr("id", "xaxis")
		.attr("transform", "translate(0," + height + ")")
		.call(axisB)
}

$(".ds_card").on('click', function(e) {
	// set all layers to default style
	for (i in idToFeature) {
		idToFeature[i].setStyle(styles['Polygon']['default'])
	}
	dsid = $(this).data('id')
	l = idToFeature[dsid]
	// raise z-index
	l.bringToFront().setStyle(styles['Polygon']['focus'])
	// get a centroid
	mappy.fitBounds(l.getBounds().pad(0.5))
})

$(".ds_card").hover(function() {
		//console.log($(this))
		let id = $(this).data('id')
		feat = idToFeature[id]
		//console.log('feat',feat)
		ogfill = "#ff9999"
		feat.setStyle({
			fillColor: 'yellow',
			color: 'red',
			fillOpacity: 0.3
		})
	},
	function() {
		let id = $(this).data('id')
		feat = idToFeature[id]
		feat.setStyle({
			fillColor: ogfill,
			color: '#333',
			fillOpacity: 0.3
		})
	}
);

$("#b_download").click(function() {
	var dsids = [];
	$('.modal-body input:checked').each(function() {
		dsids.push($(this).val());
	});
	console.log('download datasets:', dsids)
})

function startDownloadSpinner() {
	window.spinner_dl = new Spin.Spinner().spin();
	$("#ds_cards").append(spinner_dl.el);
}

$(".btn-cancel").click(function() {
	$("#downloadModal").modal('hide')
})

function showMore() {
	foo = $(this)
	console.log('foo', foo)
}

$(".dl-links a").click(function(e) {
	//e.preventDefault()
	urly = '/datasets/' + $(this).data('id') + '/augmented/' + $(this).attr('ref')
	console.log('urly', urly)
	startDownloadSpinner()
	$.ajax({
		type: 'GET',
		url: urly
	}).done(function() {
		spinner_dl.stop();
	})
})

// expose leaflet map for events, call it 'modalmap'
window.addEventListener('modalmap:init', function(e) {
	console.log('fired modalmap:init')
	window.mapmodal = e.detail.map
	mapmodal.setMaxBounds(null)


	// style/tile urls
	var mbstyle_url = 'https://api.mapbox.com/styles/v1/{id}/tiles/256/{z}/{x}/{y}?access_token={token}',
		mbtiles_url = 'https://api.mapbox.com/v3/{id}/{z}/{x}/{y}.png',
		ne_url = 'http://blog.whgazetteer.org/tiles/ne/{z}/{x}/{y}.png';

	var satellite = L.tileLayer(mbstyle_url, {
			id: 'mapbox/satellite-streets-v11',
			token: token_mb
		}),
		osm = L.tileLayer(mbstyle_url, {
			id: 'mapbox/light-v10',
			token: token_mb
		}),
		ne_mb = L.tileLayer(mbtiles_url, {
			id: 'kgeographer.ne_global',
			token: token_whg
		})

	// GL wrappers to display heatmaps
	mb_terrain = L.mapboxGL({
		style: 'mapbox://styles/kgeographer/ckhf6o8yf07fw19qhbrm7f2q7',
		accessToken: token_whg
	})

	ne_global = L.mapboxGL({
		style: 'mapbox://styles/kgeographer/ckidglq8l2nra19nzzbl995ue',
		accessToken: token_whg
	}).addTo(mapmodal)


	var baseLayers = {
		"NE global": ne_global,
		"Terrain": mb_terrain,
		//"NE self": ne,
		"OpenStreetMap": osm,
		"Satellite": satellite
	};

	layerGroup = L.control.layers(baseLayers).addTo(mapmodal);

}, false);


//function zoomTo(id) {
//mapmodal.setView(idToFeature[id]._latlng, mapmodal.getZoom() +2 )
//}

function cleanJson(pid, text) {
	z = text.replace(/'/g, '\\"')
	y = z.replace(/point/, 'Point')
	geom = JSON.parse(y)
	console.log('geom', geom)
	return JSON.parse(geom)
}
/*
styles = {
	"MultiPolygon": {
		"default": {
			fillOpacity: 0.3,
			opacity: 1,
			color: "#000",
			weight: 1,
			fillColor: "#ff9999"
		},
		"focus": {
			fillOpacity: 0.3,
			opacity: 1,
			color: "red",
			weight: 2,
			fillColor: "#ff9999"
		}
	},
	"Polygon": {
		"default": {
			fillOpacity: 0.3,
			opacity: .5,
			color: "#666",
			weight: 1,
			fillColor: "#ff9999"
		},
		"focus": {
			fillOpacity: 0.3,
			opacity: .5,
			color: "red",
			weight: 2,
			fillColor: "#ff9999"
		}
	}
}
*/
// initialize, render map w/settings.LEAFLET_CONFIG
function modalmap_init(map, options) {
	//window.geom = {"type":"FeatureCollecton","features":[]}
	window.mappo = map
	console.log('in modalmap_init()', map)
	window.geoms = []

	window.gelems = $('script').filter(function() {
		//return this.id.match(/[0-9]/) && this.text != '"null"';
		console.log('this.id', this.id)
		return this.id != '' && this.text != '"null"';
	});
	for (i = 0; i < gelems.length; i++) {
		let t_geom = cleanJson(gelems[i].id, gelems[i].text)

		//t_geom['properties'] = {"id": gelems[i].id,"ds": t_geom.ds!=null?t_geom.ds:ds}
		geoms.push(t_geom)
	}

	if (geoms.length > 0) {
		//console.log('geom: ',geom)
		idToFeature = {} // for feature lookup
		features = L.geoJSON(geoms, {
			onEachFeature: function(feature, layer) {
				f = feature;
				l = layer;
				//identifier = f.properties.id;
				console.log('feature', f)
				if (f.type != 'Point') {
					layer.setStyle(styles[f.geometry.type].default)
					//.bindPopup(f.properties.title+' ('+identifier+')'
					//)
					//idToFeature[identifier] = layer
				}
			}
		}).addTo(map);

		//mappy.setView(features.getBounds().getCenter(),6)
		// fitBounds(bounds, {padding: [50, 50]})
		mappy.options.maxZoom = 5
		mappy.fitBounds(features.getBounds())
		//mappy.setZoom(mappy.getZoom()-6)
	} else {
		console.log('no geometries, no feature')
	}
} // end map_init