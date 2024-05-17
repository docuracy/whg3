import {lch} from 'd3-color';

export function showChooser(type) {
  console.log('showChooser', type);
  let elem = '#' + type + '_chooser';
  $(elem).toggle();
}

export function deepCopy(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(deepCopy);
  }

  const result = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[key] = deepCopy(obj[key]);
    }
  }
  return result;
}

export function geomsGeoJSON(geomItemsOriginal) { // Convert array of items with .geom to GeoJSON FeatureCollection
  let geomItems = deepCopy(geomItemsOriginal);
  let featureCollection = {
    type: 'FeatureCollection',
    features: [],
  };
  let idCounter = 0;
  for (const item of geomItems) {

    item.geom = item.geom || item.geometry;

    const feature = {
      type: 'Feature',
      geometry: {
        type: 'GeometryCollection',
        geometries: Array.isArray(item.geom) ? item.geom : [item.geom],
      },
      properties: {},
      id: idCounter,
    };
    delete item.geom;
    for (const prop in item) { // Copy all non-standard properties from the original item
      if (!['type', 'geometry', 'properties'].includes(prop)) {
        feature.properties[prop] = item[prop];
      }
    }
    featureCollection.features.push(feature);
    idCounter++;
  }
  return featureCollection;
}

export function largestSubGeometry(geometry) {
  if (getType(geometry) === 'MultiPoint' || getType(geometry) ===
      'MultiLineString' || getType(geometry) === 'MultiPolygon') {
    if (geometry.coordinates && geometry.coordinates.length > 0) {
      // Initialize variables to keep track of the largest bounding box area and its corresponding geometry
      let largestArea = 0;
      let largestGeometry = null;

      for (const subGeometry of geometry.coordinates) {
        const subGeometryType = getType({
          type: getType(geometry).replace('Multi', ''),
          coordinates: subGeometry,
        });
        const subGeometryArea = area({
          type: subGeometryType,
          coordinates: subGeometry,
        });

        if (subGeometryArea > largestArea) {
          largestArea = subGeometryArea;
          largestGeometry = geometry; // Preserve any other attributes
          largestGeometry.coordinates = subGeometry;
          largestGeometry.type = subGeometryType;
        }
      }

      if (largestGeometry) {
        return largestGeometry;
      }
    }
  }
  return null; // If the input is not a Multi-geometry or if it's empty, return null.
}

export function representativePoint(geometry) {
  if (getType(geometry) === 'Point') {
    return geometry;
  } else if (getType(geometry) === 'LineString') {
    const midPoint = midpoint(geometry);
    geometry.type = 'Point';
    geometry.coordinates = midPoint.geometry.coordinates;
    return geometry;
  } else if (getType(geometry) === 'Polygon') {
    const centerPoint = centroid(geometry);
    geometry.type = 'Point';
    geometry.coordinates = centerPoint.geometry.coordinates;
    return geometry;
  } else if (getType(geometry) === 'MultiPoint' || getType(geometry) ===
      'MultiLineString' || getType(geometry) === 'MultiPolygon') {
    // For Multi-geometries, use the preceding rules for the largest sub-geometry.
    if (geometry.coordinates && geometry.coordinates.length > 0) {
      return representativePoint(largestSubGeometry(geometry));
    }
  }
  console.log('Failed to generate representative point:', geometry);
  return null; // If the geometry type is not recognized or if it's empty, return null.
}

export function equidistantLCHColors(numColors) {
  const colors = [];
  const hue_default = 60; // Default red-orange
  const hue_avoid = 150; // Avoid greens (150) or reds (30) for colourblindness
  const hue_avoid_tolerance = 40; // Either side of hue-avoid value
  const hueStep = (360 - hue_avoid_tolerance * 2) / numColors;
  for (let i = 0; i < numColors; i++) {
    const hueValue_raw = hue_default + i * hueStep;
    const hueValue_adjust = hueValue_raw > hue_avoid - hue_avoid_tolerance;
    const hueValue_adjusted = hueValue_adjust ?
        hueValue_raw + hue_avoid_tolerance * 2 :
        hueValue_raw;
    const color = lch(50, 70, hueValue_adjusted % 360).formatHex();
    colors.push(color);
  }
  return colors;
}

export function arrayColors(strings) {
  if (!Array.isArray(strings)) strings = [];
  strings.reverse().unshift('');
  const numColors = strings.length;
  const colors = equidistantLCHColors(numColors);
  let result = [];
  for (let i = 0; i < numColors; i++) {
    result.push(colors[i]);
    result.push(strings[i]);
  }
  return result.reverse();
}

export function colorTable(arrayColors, target) {
  const colorKeyTable = $('<table>').addClass('color-key-table');
  const tableBody = $('<tbody>');

  for (let i = 0; i < arrayColors.length; i += 2) {
    const label = i == arrayColors.length - 2 ?
        '<i>no relation</i>' :
        arrayColors[i];
    const color = arrayColors[i + 1];
    const row = $('<tr>');
    const colorCell = $('<td>').addClass('color-swatch');
    const colorSwatch = $('<div>').addClass('color-swatch');
    colorSwatch.css('background-color', color);
    colorCell.append(colorSwatch);
    const labelCell = $('<td>').html(label);
    row.append(colorCell, labelCell);
    tableBody.append(row);
  }

  colorKeyTable.append(tableBody);
  $(target).append(colorKeyTable);
}

export function initInfoOverlay() {

  var isCollapsed = localStorage.getItem('isCollapsed') === 'true';

  // Initialize checkbox, metadata, and toggle switch, based on isCollapsed
  $('#checkbox').prop('checked', isCollapsed);
  $('#metadata').toggle(!isCollapsed);
  $('#ds_info').toggleClass('info-collapsed', isCollapsed);

  $('#collapseExpand').click(function() {
    $('#metadata').slideToggle(300, function() {
      $('#ds_info').toggleClass('info-collapsed');
    });
  });

  // Update the state when the checkbox is checked
  $('#checkbox').change(function() {
    localStorage.setItem('isCollapsed', $(this).is(':checked'));
  });

}

export function attributionString(data) {
  let attributionParts = [];
  if (!!data && data.attribution) {
    attributionParts.push(data.attribution);
  }
  if (!!data && data.citation) {
    attributionParts.push(data.citation);
  }
  let attribution = '';
  if (attributionParts.length > 0) attribution = attributionParts.join(', ');

  let attributionStringParts = [];
  if (!!data) attributionStringParts.push(
      data.attribution || data.citation || attribution);

  return attributionStringParts.join(' | ');
}

export function startSpinner(spinnerId = 'dataset_content', scale = .5) {
  // TODO: scale could be set automatically based on size of the container element
  const newSpinner = new Spinner({
    scale: scale,
    color: '#004080',
  }).spin();
  $((spinnerId.startsWith('.') ? '' : '#') + spinnerId).append(newSpinner.el);
  return newSpinner;
}

export function initUtils(mappy) {
	
  $("[rel='tooltip']").tooltip();

  // generic clipboard for modal and non-modal containers
  document.querySelectorAll('.clippy').forEach(element => {
    element.addEventListener('click', function(e) {
      e.preventDefault();

      // Dynamically determine the container based on the trigger element
      // find the closest '.modal' parent but fallback to 'document.body' if not found
      let container = $(this).closest('.modal')[0] || document.body;

      // Now, initialize ClipboardJS
      let clipboard = new ClipboardJS(element, {
        text: function(trigger) {
          let target = trigger.getAttribute('data-clipboard-target');
          return target ? $(target).text() : trigger.getAttribute('aria-label');
        },
        container: container,
      }).on('success', function(e) {
        console.log('Content copied to clipboard successfully!');
        e.clearSelection();
		    const tooltip = bootstrap.Tooltip.getInstance(e.trigger);
		    tooltip.setContent({ '.tooltip-inner': 'Copied!' });
		    setTimeout(function() { // Hide the tooltip after 2 seconds
		        tooltip.hide();
		    	tooltip.setContent({ '.tooltip-inner': tooltip._config.title }) // Restore original text
		    }, 2000);
      });

      // Manually trigger the copy action
      clipboard.onClick(e);
    });
  });

  // new ClipboardJS('.clippy', {
  // 	text: function(trigger) {
  // 		let target = trigger.getAttribute('data-clipboard-target');
  // 		if (target == null) {
  // 			return trigger.getAttribute('aria-label');
  // 		} else {
  // 			return $(target).text();
  // 		}
  // 	},
  //   container: function(trigger) {
  //       return $(trigger).closest('.modal')[0];
  //   }
  // 	// container: document.getElementById('downloadModal') || document.body
  // }).on('success', function(e) {
  // 	console.log('clipped')
  // 	e.clearSelection();
  // 	var $trigger = $(e.trigger);
  // 	$trigger.tooltip('destroy').attr('title', 'Copied!').tooltip();
  // 	// $trigger.tooltip('dispose').attr('title', 'Copied!').tooltip();
  // 	$trigger.tooltip('show');
  // 	setTimeout(function() {
  // 		$trigger.tooltip('hide');
  // 	}, 2000);
  // });

  // image modal
  $('body').on('click', '.pop, #anno_img', function() {
    let image = $(this).is('img') ? $(this) : $(this).find('img:first');
    let url = image.attr('src');
    let txt = image.attr('alt');
    // let re = /(.png|.jpg|.jpeg|.gif|.tif)/g // TODO: Remove if not required
    console.log('url', url);
    $('#header_text').html(txt);
    $('.imagepreview').attr('src', url);
    $('#imageModal').modal('show');
  });
  // TODO: Figure out why the modal close button doesn't work without this additional code:
  $('#imageModal button.close').click(function() {
    $('#imageModal').modal('hide');
  });

  $('clearlines').click(function() {//TODO: Is this redundant?
    try {
      mappy.removeLayer('gl_active_poly');
    } catch (error) {
      console.log('Layer ID error.', error);
    }
    //mappy.removeLayer('outline')
  });

  // for collection description only
  $('.a_more_descrip').click(function() {
    let clicked = $(this);
    clicked.hide();
    clicked.parent().find('#dots_descrip').hide();
    clicked.next().show();
    $('.a_less_descrip').show();
  });
  $('.a_less_descrip').click(function() {
    let clicked = $(this);
    clicked.hide(); // hide 'less' link
    $('.more_descrip').hide(); // hide the extra text again
    $('#dots_descrip').show(); // show dots again
    $('.a_more_descrip').show(); // show more link again
  });

  // Help popups and associated .selector used only in Collection Build pages
  $('.help-matches').click(function() {
    let page = $(this).data('id');
    console.log('help:', page);
    $('.selector').dialog('open');
  });

  $('.selector').dialog({
    resizable: false,
    autoOpen: false,
    height: 500,
    width: 700,
    title: 'WHG Help',
    modal: true,
    buttons: {
      'Close': function() {
        console.log('close dialog');
        $(this).dialog('close');
      },
    },
    open: function(event, ui) {
      $('#helpme').load('/media/help/' + page + '.html');
    },
    show: {
      effect: 'fade',
      duration: 400,
    },
    hide: {
      effect: 'fade',
      duration: 400,
    },
  });

}

export function minmaxer(timespans) {
  let starts = [];
  let ends = [];
  for (var t in timespans) {
    // gets 'in', 'earliest' or 'latest'
    starts.push(Object.values(timespans[t].start)[0]);
    ends.push(!!timespans[t].end ? Object.values(timespans[t].end)[0] : -1);
  }
  return [Math.max.apply(null, starts), Math.max.apply(null, ends)];
}

export function get_ds_list_stats(allFeatures, allExtents = []) {

  let min = Infinity;
  let max = -Infinity;
  let seqMin = Infinity;
  let seqMax = -Infinity;
  for (let i = 0; i < allFeatures.length; i++) {
    // Convert strings to integers
    const featureMin = (/^-?\d+$/.test(allFeatures[i].properties.min)) ?
        parseInt(allFeatures[i].properties.min) :
        false;
    const featureMax = (/^-?\d+$/.test(allFeatures[i].properties.max)) ?
        parseInt(allFeatures[i].properties.max) :
        false;
    const seqValue = (/^-?\d+$/.test(allFeatures[i].properties.seq)) ?
        parseInt(allFeatures[i].properties.seq) :
        false;
    if (featureMin && featureMax) {
      min = Math.min(min, featureMin);
      max = Math.max(max, featureMax);
    }
    if (seqValue) {
      seqMin = Math.min(seqMin, seqValue);
      seqMax = Math.max(seqMax, seqValue);
    }
  }
  if (!isFinite(min)) min = -3000;
  if (!isFinite(max)) max = 2000;

  const geojson = {
    'type': 'FeatureCollection',
    'features': [
      ...allFeatures.filter(
          feature => feature.geometry && feature.geometry.coordinates), // Ignore the nullGeometry features returned for vector tilesets
      ...allExtents.map((extent) => ({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [extent[0], extent[1]],
              [extent[2], extent[1]],
              [extent[2], extent[3]],
              [extent[0], extent[3]],
              [extent[0], extent[1]],
            ],
          ],
        },
      })),
    ],
  };

  return {
    min: min,
    max: max,
    seqmin: seqMin,
    seqmax: seqMax,
    count: allFeatures.length,
    extent: bbox(geojson),
  };
}