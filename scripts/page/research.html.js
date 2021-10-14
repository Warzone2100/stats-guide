/*
	This file is part of 'Warzone 2100 Guide by crab'.

	'Warzone 2100 Guide by crab' is free software; you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation; either version 2 of the License, or
	(at your option) any later version.

	'Warzone 2100 Guide by crab' is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with 'Warzone 2100 Guide by crab'; if not, write to the Free Software
	Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA
*/

var player = 0;

timeline_options = {
    tanks: {
        value: true,
        label: "Tanks",
    },
    cyborgs: {
        value: true,
        label: "Cyborgs",
    },
    vtol: {
        value: true,
        label: "VTOL",
    },
    structures: {
        value: true,
        label: "Structures",
    },
    armor_upgrades: {
        value: false,
        label: "Armor upgrades",
    },
    weapon_upgrades: {
        value: false,
        label: "Weapons upgrades",
    },
}

tree_options = {
    defenses: {
        value: true,
        label: "Defenses",
    },
}

$(function () {

    InitDataObjects();

    $("#tabs_left").tabs();
    $("#tabs_left").tabs("option", "active", 0);

    $('#tabs_left ul:first li:eq(0) a').click(null, function (event) {
        url_pushState('');
        ShowResearchListView();
    });

    $('#tabs_left ul:first li:eq(1) a').click(null, function (event) {
        url_pushState('?tree=1');
        ShowResearchTree();
    });

    $('#tabs_left ul:first li:eq(2) a').click(null, function (event) {
        url_pushState('?timeline=1');
        ShowResearchTimeline();
    });

    $('#tabs_left ul:first li:eq(3) a').click(null, function (event) {
        url_pushState('');
        DrawDetailsTab_Init();
    });

    LoadAllObjects(function () {
        DoResearchAll(player_all_researched, true, function () {
            SelectContentByURLData();
        });
    })

    DrawSection_type2_1_html("intro_header", "Introduction").append($('#intro_content'));
    //DrawSection_type2_1_html("time_table_header", "Research Timeline").append($('#time_table_container'));

});

$(window).on("popstate", function (event) {
    /* Chrome, Opera, Firefox - page load / forward/backward */
    /* IE - forward/backward
    event.originalEvent.state == null when onpopstate triggered in Chrome/Firefox
    */
    if (event.originalEvent.state) {  //this called also on PAGE FIRST LOAD
        console.log('onpopstate triggered');
        SelectContentByURLData();
    }
});

var currentCanvas;
function setCurrentCanvas(canvas) {
    currentCanvas = canvas;
    resizeCanvas();
}
function resizeCanvas() {
    if (currentCanvas != undefined) {
        $(currentCanvas.wrapperEl).hide();
        var newWidth = Math.max($('#research_tree_container').width(), 900);
        if (newWidth != currentCanvas.getWidth()) {
            currentCanvas.setWidth(newWidth);
            currentCanvas.requestRenderAll();
        }
        $(currentCanvas.wrapperEl).show();
    }
}
var canvasResizeTimeoutId;
$(window).on('resize', function(){
    if (currentCanvas != undefined) {
        clearTimeout(canvasResizeTimeoutId);
        canvasResizeTimeoutId = setTimeout(resizeCanvas, 250);
    }
});

function SelectContentByURLData()
{
    var uri_vars = getUrlVars();
    if (uri_vars["details_id"] != undefined) {
        /* open Details View */
        DrawDetailsTab_Init(getUrlVars()["details_id"]);
    } else if (uri_vars["tree"] != undefined) {
        /* open Tree View */

        if (uri_vars["component_id"] != undefined) {
            /* Show research tree for only one component */
            var tree_options2 = {};
            tree_options2.path_to_component = uri_vars["component_id"];
            ShowResearchTree(tree_options2);
        } else {
            ShowResearchTree();
        }
    } else if (uri_vars["tree_static"] != undefined) {
        /* open Tree View */
        var tree_options2 = { useStaticCanvas: true };
        if (uri_vars["component_id"] != undefined) {
            /* Show research tree for only one component */
            tree_options2.path_to_component = uri_vars["component_id"];
        }
        ShowResearchTree(tree_options2);
    }

    else if (uri_vars["timeline"] != undefined) {
        /* open TimeLine View */
        ShowResearchTimeline();
    } else {
        /* open List View */
        $("#tabs_left").tabs("option", "active", 0);
        ShowResearchListView();
    }
}

function ShowResearchListView() {
    $("#tabs_left").tabs("option", "active", 0);

    if ($('#left-tabs-listview').children().length > 0)
    {
        /* Do not draw list view if it is drawn already */
        return;
    }

    var descr_html = "Below listed all possible research items in Warzone2100.<br/>\
List sorted by <b>minimum research time</b>. \
";

    $('#left-tabs-listview').html('<div id="reslistcontainer_header"></div><div id="reslistcontainer">' + descr_html + '<div id="restablecontainer"></div></div>');
    DrawSection_type2_1_html("reslistcontainer_header", "List of research").append($('#reslistcontainer'));
    var container_id = "restablecontainer";

    var grid_data = [];
    for (var res_id in Researches.loaded_data_hash) {
        if (can_research(res_id))
        {
            var research = Researches.loaded_data_hash[res_id];
            //research.minResearchTime = 
            grid_data.push(research);
        }
    }

    grid_data.sort(function (a, b) {
        if (a.minResearchTime == undefined)
            return 1;
        if (b.minResearchTime == undefined)
            return -1;
        return a.minResearchTime > b.minResearchTime ? 1 : -1;
    });

    var grid_element_id = ResetGridContainer(container_id);
    var grid = $(grid_element_id);
    grid.jqGrid
    ({
        datatype: "local",
        data: grid_data,
        rowNum: grid_data.length,
        height: 'auto',
        colModel:
        [
            { label: "", name: "grid_id", key: true, hidden: true },
            {
                label: " ",
                name: 'pic',
                width: '65px',
                sortable: false,
                search: false,
                formatter: function (cellvalue, options, rowObject) {
                    return '<a href="research.html?details_id=' + rowObject.grid_id + '" onclick="ShowResearchDetails(\'' + rowObject.grid_id + '\'); return false;">' + Researches.GetIconHtml_Function(rowObject) + '</a>';
                },
            },
            {
                label: " ", name: "name",
                formatter: function (cellvalue, options, rowObject) {
                    return '<a href="research.html?details_id=' + rowObject.grid_id + '" onclick="ShowResearchDetails(\'' + rowObject.grid_id + '\'); return false;">' + cellvalue + '</a>';
                },
            },
            
            {
                label: "Price",
                formatter: function (cellvalue, options, rowObject) {
                    return rowObject.researchPower == undefined ? 0 : rowObject.researchPower;
                },
                width: 70,
            },
            {
                label: "Research Points",
                formatter: function (cellvalue, options, rowObject) {
                    return rowObject.researchPoints == undefined ? 0 : rowObject.researchPoints;
                },
                width: 70,
            },

            {
                label: "Min research time",
                name: "minResearchTime",
                width: 80,
                sorttype: "int",
                formatter: function (cellvalue, options, rowObject) {
                    if (cellvalue != undefined) {
                        if (cellvalue < 3600) {
                            return cellvalue.toMMSS();
                        } else {
                            return cellvalue.toHHMMSS();
                        }
                    }
                    return ' - ';
                },
            },
        ],
        onSelectRow: function (rowid) {
        },
        loadonce: true,
        ignoreCase: true, //make search case insensitive
    });
}

function ShowResearchTree(options_type2) {
    $("#tabs_left").tabs("option", "active", 1);

    var options_div_id = "restree_container_tree_options";

    $('#research_tree_container').html('<div id="tree_scale_slider_container" style="width:400px;display:inline-block"></div><div id="' + options_div_id + '" style="display:inline-block;"></div><div id="restree_container"></div><div id="canvas_hscroll" width="100%"  ></div>');


    var scale_slider = DrawScaleSlider("tree_scale_slider_container", 200, function (value) {
        var scale = value / 100;
        DrawResearchTree("restree_container", scale, tree_options, options_type2, function (canvas) {
            setCurrentCanvas(canvas);
            DrawHorizontalScrollbar('canvas_hscroll', 'research_tree_container', canvas);
        });
    });
    DrawHorizontalOptionsMenu(options_div_id, tree_options, function () {
        var scale = scale_slider.slider("value") / 100;
        DrawResearchTree("restree_container", scale, tree_options, options_type2, function (canvas) {
            setCurrentCanvas(canvas);
            DrawHorizontalScrollbar('canvas_hscroll', 'research_tree_container', canvas);
        });
    });
    
    if (options_type2)
    {
        if(options_type2.path_to_component)
        {
            var comp_id = options_type2.path_to_component;
            var DataObject = FindDataObject(comp_id);
            var comp = DataObject.loaded_data_hash[comp_id];
            var html_header = '<span style="font-size:1.2em; margin-top: 25px"><p>Showing Research Path to component: <b>' + comp.name + '</b></p></span>';
            $(html_header).insertBefore($('#tree_scale_slider_container'));
        }
    }

    function SaveClientFile(name, content) {
        window.URL = window.webkitURL || window.URL;
        window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
        var file = new Blob([content], { type: 'text/plain' });

        var a = document.createElement('a');
        a.href = window.URL.createObjectURL(file);
        a.download = name;
        a.textContent = 'Download file!';
        a.click();
    }

    DrawResearchTree("restree_container", 2, tree_options, options_type2, function (canvas) {
        setCurrentCanvas(canvas);
        var container = $('#load_as_image_btn_container');
        if (container.length > 0)
        {
            container.html('');
        } else
        {
            $('#intro_content').append('<div id="load_as_image_btn_container"><div>');
        }
        $('#load_as_image_btn_container').append('<button type="button" id="load_as_image_btn">Load Research Tree As Image</button>');
        $('#load_as_image_btn').button().click(canvas, function (event) {
            var canvas_ = event.data;

            // expand canvas width to the full width
            var originalCanvasWidth = canvas_.width;
            canvas.setWidth(canvas_.wzFullViewPortWidth);

            //var image = canvas_.toDataURL("image/png").replace("image/png", "image/octet-stream");  // here is the most important part because if you dont replace you will get a DOM 18 exception.
            //window.location.href = image;

            //var image = canvas_.toDataURL("image/png").replace("image/png", "image/octet-stream");
            var img_b64 = canvas_.toDataURL("image/png", { format: "png" });

            //var blob = new Blob([img_b64.substr(img_b64.indexOf("base64") + 7)]);

            //SaveClientFile('res_tree.png', blob);

            // restore original canvas width
            canvas.setWidth(originalCanvasWidth);


            var html = '<!DOCTYPE html>\
<html xmlns="http://www.w3.org/1999/xhtml">\
    <head>\
    <title>Отчет</title>\
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />\
    </head>\
    <body>\
    <img src="' + img_b64 + '"><img>\
    </body>\
</html>';

            SaveClientFile('res_tree.html', html);

            //var imgdata = canvas_.toDataURL("image/png", { format: "png" });
            //SaveClientFile('res_tree.png', imgdata);
            //window.location.href = data;
            //ShowLoading('tabs_left');
            //$.ajax({
            //    url: "saveme.php",
            //    data: JSON.stringify({ imgdata: imgdata }),
            //    datatype: "text",
            //    success: function (msg) {
                    
            //        HideLoading('tabs_left');
            //    },
            //    error: function (msg) {
            //        HideLoading('tabs_left');
            //        alert('Error happened. Please try to reload page.');
            //    }
            //});
        });
        DrawHorizontalScrollbar('canvas_hscroll', 'research_tree_container', canvas);
        
    });
}

function ShowResearchTimeline() {
    $("#tabs_left").tabs("option", "active", 2);
    DrawResearchTimeline("time_table_container");
}

function ShowResearchDetails(res_id) {
    url_pushState('?details_id=' + res_id);
    DrawDetailsTab_Init(res_id);
}

function DrawDetailsTab_Init(research_id) {

    $("#tabs_left").tabs("option", "active", 3);


    if (research_id == undefined) {
        if(drawn_detail_research_id != null)
        {
            research_id = drawn_detail_research_id;
            url_pushState('?details_id=' + research_id);
        }
    }

    if (research_id != undefined)
    {
        DrawResearchDetailsParameters(research_id);
    }

    $("#select_research_button").button({
        icons: {
            primary: "ui-icon-triangle-1-s",
        }
    }).click(function (event) {
        event.preventDefault();
        ShowSeletDialog_forDataObject(Researches, null, function (res_id_new) {
            DrawResearchDetailsParameters(res_id_new);
        });
    });
}

var drawn_detail_research_id = null;
function DrawResearchDetailsParameters(research_id) {
    drawn_detail_research_id = research_id;
    var research = Researches.loaded_data_hash[research_id];

    if (research != undefined) {
        $("#research_detail_data_container").show();
        scrollToId('#tabs_left');
    }

    $("#select_research_button").button({
        icons: {
            primary: "ui-icon-triangle-1-s",
        }
    }).click(function (event) {
        event.preventDefault();
        ShowSeletDialog_forDataObject(Researches, research_id, function (res_id_new) {
            DrawresearchDetailsParameters(res_id_new);
        });
    });

    $("#research_icon").html(Researches.GetIconHtml_Function(research));
    $("#research_name_label").text(research.name);

    /* Draw description */
    {
        $('#details_description').html('');
        /* Show button "Overview research path" */
        var res_comp_row = ResearchedComponents[player_all_researched][research_id];
        if (res_comp_row != undefined) {
            var research = Researches.loaded_data_hash[res_comp_row.research_id];
            var res_path_button_html = '<br/><button type="button" id="show_respath_button_span">Overview research path</button>'
            $('#details_description').append(res_path_button_html);
            $('#show_respath_button_span').button().click(null, function (event) {
                event.preventDefault();
                window.open("research.html?tree=1&component_id=" + research_id);
            }).css("font-size", "0.8em");
        }
    }

    /* Draw parameters of research */
    {
        $('#research_details').html('<div id="research_details_container"></div>');
        grid_data = [];
        {
            var row = new Object;
            row.name = 'Price';
            row.base = PropDescr("price").format_html(research.researchPower);
            row.group = '';
            row.descr = 'Price needed to start research';
            grid_data.push(row);
        }
        {
            var row = new Object;
            row.name = 'Research points';
            row.base = PropDescr("researchPoints").format_html(research.researchPoints);
            row.group = '';
            row.descr = 'Each Research Facility produces 12 - 54 Research Points per second. It depends on the presence of Research Module and Research Upgrades';
            grid_data.push(row);
        }
        {
            var row = new Object;
            row.name = 'Minimum Time to research';
            row.base = PropDescr("minResearchTime").format_html(research.minResearchTime.tohhMMSS());
            row.group = '';
            row.descr = 'Minimum time calculated by program. In real games time time can be reachable depending of game start conditions/number of laboratories etc.';
            grid_data.push(row);
        }

        var grid_element_id = ResetGridContainer("research_details_container");
        var grid = $(grid_element_id);
        grid.jqGrid
        ({
            datatype: "local",
            data: grid_data,
            rowNum: grid_data.length,
            height: 'auto',
            colModel:
                [
                    { name: "", width: '20px', sortable: false, search: false },
                    { name: "name", label: 'Parameter', key: true, width: '200px' },
                    {
                        name: "base", label: 'Base value', width: '60px', fixed: true,
                        formatter: function (cellvalue, options, rowObject) {
                            if (typeof cellvalue != "string" && isNaN(cellvalue)) {
                                return '';
                            }
                            return cellvalue;
                        }
                    },
                    { name: "group", label: 'group', width: '100px' },
                    {
                        name: "descr", label: 'Description', width: '300px', fixed: true,
                        formatter: function (cellvalue, options, rowObject) {
                            if (cellvalue == undefined) {
                                cellvalue = ' - ';
                            }
                            return '<label style="color:gray;font-size:0.9em">' + cellvalue + '</label>'
                        },

                    },
                ],
            loadonce: true,
            grouping: true,
            groupingView: {
                groupField: ['group'],
                groupText: ['<b> {0} </b>'],
                groupColumnShow: [false]
            },
        });
    }

    /* Draw Research Path */
    var res_path_data = GetResearchPath_SubTree(research_id, player_all_researched, 2);
    DrawResearchPath_Tree("research_path_container", res_path_data);

    /* Show pre-requisite research icons */
    {
        var grid_data = [];
        if (research.requiredResearch != undefined) {
            var pre_res_ids = research.requiredResearch;
            for(var p in pre_res_ids)
            {
                grid_data.push(Researches.loaded_data_hash[pre_res_ids[p]]);
            }
        }
        $('#details_preres_container').html('<div id="pre_res_table_container"></div>');
        show_short_res_table("pre_res_table_container", grid_data);
    }

    /* Show open new research icons */
    {
        var grid_data = [];
        for(var i in Researches.loaded_data_hash)
        {
            var res_n = Researches.loaded_data_hash[i];
            if(res_n.requiredResearch != undefined)
            {
                var pre_res_ids = res_n.requiredResearch;
                for (var p in pre_res_ids) {
                    if(pre_res_ids[p] == research.grid_id)
                    {
                        grid_data.push(res_n);
                    }
                }
            }
        }
        $('#details_openres_container').html('<div id="opennew_res_table_container"></div>');
        show_short_res_table("opennew_res_table_container", grid_data);
    }

    /* Show result components */
    {
        DrawResultComponents(research, "details_result_components");
    }

    /* Show result upgrades */
    {
        var grid_data = [];
        for (var obj_type_id in Upgrades[player_all_researched]) {
            var obj_type = Upgrades[player_all_researched][obj_type_id];
            for (var i in obj_type) {
                var comp_upgraded = obj_type[i];
                var comp_id = comp_upgraded.grid_id;
                if (!can_research(comp_id) && !startSrtuctures[comp_id]) {
                    continue;
                }
                if (comp_upgraded.upgrade_history) {
                    var upgr_hist = comp_upgraded.upgrade_history;
                    for (var h in upgr_hist) {
                        if (upgr_hist[h].research_id == research.grid_id) {
                            var DataObject = FindDataObject(comp_upgraded.grid_id);
                            var row = {
                                comp_id: comp_id,
                                hint: upgr_hist[h].hint,
                                value: upgr_hist[h].value,
                                DataObject: DataObject,
                            };
                            grid_data.push(row);
                        }
                    }
                }
            }
        }

        $('#details_result_upgrades').html('<div id="details_result_upgrades_table_container"></div>');
        var grid_element_id = ResetGridContainer("details_result_upgrades_table_container");
        var grid = $(grid_element_id);
        grid.jqGrid
        ({
            datatype: "local",
            data: grid_data,
            rowNum: grid_data.length,
            height: 'auto',
            colModel:
                [
                    { label: "", name: "grid_id", key: true, hidden: true },
                    {
                        label: " ",
                        name: 'pic',
                        width: '65px',
                        sortable: false,
                        search: false,
                        formatter: function (cellvalue, options, rowObject) {
                            var DataObject = rowObject.DataObject;
                            var href = DataObject.page_url + "?details_id=" + rowObject.comp_id;
                            var comp = rowObject.DataObject.loaded_data_hash[rowObject.comp_id];
                            return '<a href="' + href + '">' + DataObject.GetIconHtml_Function(comp) + '</a>';
                        },
                    },
                    {
                        label: "Component name", name: "name",
                        formatter: function (cellvalue, options, rowObject) {
                            return rowObject.DataObject.loaded_data_hash[rowObject.comp_id].name;
                        },
                    },
                    {
                        label: "Upgrade", name: "name",
                        formatter: function (cellvalue, options, rowObject) {
                            if (rowObject.value > 0) {
                                return rowObject.hint + "  +" + rowObject.value + '%';
                            } else {
                                return rowObject.hint + "  -" + rowObject.value + '%';
                            }
                        },
                    },
                ],
            loadonce: true,
        });
    }
}
    
function DrawHorizontalOptionsMenu(container_id, options, func_onchanged_callback) {
    var html = '<ul  class="MyStyledLinkMenu navmenu2">';
    for (var opt in options) {
        var opt_id = container_id + "_" + opt;
        var opt_label = options[opt].label;
        var opt_value = options[opt].value;
        html += '<li><span class="ui-icon ui-icon-pin-w" style="display:inline-block"></span><a style="cursor:pointer" id="' + opt_id + '" data-opt-id="' + opt + '">' + opt_label + '</a></li>';
    }
    html += '</ul>';
    $('#' + container_id).html(html);

    for (var opt in options) {
        var opt_id = container_id + "_" + opt;
        var opt_label = options[opt].label;
        var opt_value = options[opt].value;
        if (opt_value) {
            $('#' + opt_id).css("text-decoration", "none");
        } else {
            $('#' + opt_id).css("text-decoration", "line-through");
        }
        $('#' + opt_id).click(options, function (event) {
            var opt_elem = $(this);
            var opt_name = opt_elem.attr('data-opt-id');
            var options_obj = event.data;
            var opt_obj = options_obj[opt_name];
            opt_obj.value = !opt_obj.value;
            if (opt_obj.value) {
                opt_elem.css("text-decoration", "none");
            } else {
                opt_elem.css("text-decoration", "line-through");
            }
            if (func_onchanged_callback) {
                func_onchanged_callback();
            }
        });
    }

}
function DrawResearchTimeline(container_id) {

    var scale_slider_id = container_id + "_timeline_slider";
    var options_div_id = container_id + "_timeline_options";
    var canva_id = container_id + "_canva";
    $('#' + container_id).html('<div id="' + scale_slider_id + '" style="width:400px;display:inline-block" ></div><div id="' + options_div_id + '" style="display:inline-block;"></div><div id="' + canva_id + '" style="background-color:white"></div>');

    
    var scale_slider = DrawScaleSlider(scale_slider_id, 100, function (value) {
        var scale = value / 100;
        DrawCompTimeTable(canva_id, scale, timeline_options);
    });
    DrawHorizontalOptionsMenu(options_div_id, timeline_options, function () {
        var scale = scale_slider.slider("value") / 100;
        DrawCompTimeTable(canva_id, scale, timeline_options);
    });

    DrawCompTimeTable(canva_id, 1, timeline_options);
}

var scale_setted_timeout;
function DrawScaleSlider(container_id, init_value, slide_function) {

    $('#' + container_id).html('');
    var slider_id = container_id + "_scale_slider";
    var input_id = container_id + "_scale_slider_input";
    var slider_elem = $('<label for="' + input_id + '">Scale:</label><input type="text" id="' + input_id + '" style="border: 0; font-weight: bold;" /><div id="' + slider_id + '"></div>');
    slider_elem.appendTo($("#" + container_id));
    jQuery('#' + slider_id).slider({
        min: 10,
        max: 300,
        step: 1,
        value: init_value,
        range: "min",
        slide: function (event, ui) {
            jQuery('#' + input_id).val(ui.value + "%");
            if (scale_setted_timeout != undefined) {
                clearTimeout(scale_setted_timeout);
                scale_setted_timeout = undefined;
            };
            scale_setted_timeout = setTimeout(function () {
                if (slide_function != undefined) {
                    slide_function($('#' + slider_id).slider("value"));
                }
            }, 300);
        }
    });
    $('#' + input_id).val($('#' + slider_id).slider("value") + "%");
    return $('#' + slider_id);
}

function DrawHorizontalScrollbar(container_id, parent_container_id, canvas) {
    // initializing the horizontal scrollbar
    $("#" + container_id).slider( {
    min: 0,
    max: 100,
    value: 0,
    slide: function( event, ui ) {
        if (this.current_hscroll == undefined)
        {
            this.current_hscroll = 0;
        }
        var width_to_scroll = canvas.wzFullViewPortWidth * canvas.getZoom() - canvas.width;
        if ( width_to_scroll > 0 ) {
            var scroll_grad = width_to_scroll / 100;
            canvas.absolutePan(new fabric.Point( ui.value * scroll_grad, canvas.viewportTransform[5] ));
            canvas.requestRenderAll();
        }
        this.current_hscroll = ui.value;
    }
    });
    canvas.on('mouse:move', function(opt) {
        if (this.isDragging) {
            var zoom = canvas.getZoom();
            var vpt = this.viewportTransform;
            // update horizontal scrollbar position
            var width_to_scroll = canvas.wzFullViewPortWidth * canvas.getZoom() - canvas.width;
            var amountScrolled = Math.abs(canvas.viewportTransform[4]);
            var newValue = (amountScrolled / width_to_scroll) * 100;
            $("#" + container_id).slider( "option", "value", newValue );
        }
    });
}

function CreateComponentsLines(options) {

    /* Prepare array of Research Lines */
    var res_lines = [];
    {
        /* Body line */
        var line = {};
        line.DataObject = Bodies;
        line.items_ids = {};
        line.attr_func = function (elem) {
            elem.attr("stroke", "green");
        }
        var body_cnt = 0;
        for (var body_id in Bodies.loaded_data_hash) {
            if (!can_research(body_id)) {
                continue;
            }
            var body = Bodies.loaded_data_hash[body_id];
            if (!options.tanks.value && !options.vtol.value) {
                if (body.class == "Droids" || body.class == "Transports") {
                    continue;
                }
            }

            if (!options.cyborgs.value) {
                if (body.class == "Cyborgs") {
                    continue;
                }
            }
            line.items_ids[body_id] = 1;
            body_cnt++;
        }
        if (body_cnt > 0) {
            res_lines.push(line);
        }
        if (options.armor_upgrades.value && options.cyborgs.value) {
            var upgr_line = {};
            upgr_line.attr_func = function (elem) {
                elem.attr("stroke", "green").attr("opacity", "0.55");
            }
            upgr_line.DataObject = Researches;
            upgr_line.items_ids = {};
            upgr_line.height = 35;
            upgr_line.parent_line = line;
            var tmp_cnt = 0;
            var res_class = "Cyborgs";
            for (var ires in Researches.loaded_data) {
                var res = Researches.loaded_data[ires];
                if (is_cyborg_body_upgrade(res)) {
                    upgr_line.items_ids[res.grid_id] = 1;
                    tmp_cnt++;
                }
            }
            if (tmp_cnt > 0) {
                res_lines.push(upgr_line);
            }
        }
        if (options.armor_upgrades.value && (options.tanks.value || options.vtol.value)) {
            var upgr_line = {};
            upgr_line.attr_func = function (elem) {
                elem.attr("stroke", "green").attr("opacity", "0.55");
            }
            upgr_line.DataObject = Researches;
            upgr_line.items_ids = {};
            upgr_line.height = 35;
            upgr_line.parent_line = line;
            var tmp_cnt = 0;
            var res_class = "Droids";
            for (var ires in Researches.loaded_data) {
                var res = Researches.loaded_data[ires];
                if (is_tank_body_upgrade(res)) {
                    upgr_line.items_ids[res.grid_id] = 1;
                    tmp_cnt++;
                }
            }
            if (tmp_cnt > 0) {
                res_lines.push(upgr_line);
            }
        }
    }
    {
        /* propulsion line */
        var line = {};
        line.attr_func = function (elem) {
            elem.attr("stroke", "darkblue");
        }
        line.DataObject = Propulsion;
        line.items_ids = {};
        var prop_cnt = 0;
        for (var prop_id in Propulsion.loaded_data_hash) {
            if (!can_research(prop_id)) {
                continue;
            }
            var prop = Propulsion.loaded_data_hash[prop_id];
            if (!options.tanks.value) {
                if (prop.type != "Legged") {
                    continue;
                }
            }
            if (!options.cyborgs.value) {
                if (prop.type == "Legged") {
                    continue;
                }
            }
            prop_cnt++;
            line.items_ids[prop_id] = 1;
        }
        if (prop_cnt > 0) {
            res_lines.push(line);
        }
    }
    var pushed_structs = {};
    if (options.structures.value) {
        /* Base structures line */
        var line = {};
        line.attr_func = function (elem) {
            elem.attr("stroke", "darkpink");
        }
        line.DataObject = Structures;
        line.items_ids = {};
        for (var si in Structures.loaded_data) {
            var struc = Structures.loaded_data[si];
            if (can_research(struc.grid_id)) {
                if (struc.type == "FACTORY MODULE" || struc.type == "POWER MODULE" || struc.type == "RESEARCH MODULE"
                    || struc.type == "REPAIR FACILITY" || struc.type == "SAT UPLINK" || struc.type == "CYBORG FACTORY"
                    || struc.type == "VTOL FACTORY" || struc.type == "REARM PAD") {
                    line.items_ids[struc.grid_id] = 1;
                    pushed_structs[struc.grid_id] = 1;
                }
            }
        }
        res_lines.push(line);
    }
    {
        /* Weapon lines */
        var weap_res_classes = {};
        for (var i in Weapons.loaded_data) {
            var weapon = Weapons.loaded_data[i];
            if (!can_research(weapon.grid_id)) {
                continue;
            }
            var res_class = weapon.weaponSubClass;
            if (res_class == undefined) {
                continue;
            }
            var abils = Weapon_GetAbilities(weapon);
            if (!options.cyborgs.value) {
                if (abils.CyborgWeapon) {
                    continue;
                }
            }
            if (!options.vtol.value) {
                if (abils.VTOLWeapon) {
                    continue;
                }
            }

            if (!options.tanks.value) {
                if (!abils.VTOLWeapon && !abils.CyborgWeapon) {
                    continue;
                }
            }

            if (weap_res_classes[res_class] == undefined) {
                weap_res_classes[res_class] = {};
                weap_res_classes[res_class].minResearchTime = weapon.minResearchTime;
                weap_res_classes[res_class].weapons_ids = {};;
                weap_res_classes[res_class].weapons_ids[weapon.grid_id] = 1;
            } else {
                weap_res_classes[res_class].weapons_ids[weapon.grid_id] = 1;
                weap_res_classes[res_class].minResearchTime = Math.min(weapon.minResearchTime, weap_res_classes[res_class].minResearchTime);
            }
        }
        var weap_res_classes_array = [];
        for (var res_class in weap_res_classes) {
            weap_res_classes_array.push({
                res_class: res_class,
                minResearchTime: weap_res_classes[res_class].minResearchTime,
                weapons_ids: weap_res_classes[res_class].weapons_ids,
                res_class: res_class,
            });
        }
        //..sort weapon lines by minimal research time
        weap_res_classes_array.sort(function (elm1, elm2) {
            return elm1.minResearchTime - elm2.minResearchTime;
        });

        for (var i in weap_res_classes_array) {
            var line = {};
            line.attr_func = function (elem) {
                elem.attr("stroke", "darkred");
            }
            line.DataObject = Weapons;
            var item_cnt = 0;
            for (var weap_idtmp in weap_res_classes_array[i].weapons_ids) {
                item_cnt++;
            }
            if (item_cnt > 0) {
                line.items_ids = weap_res_classes_array[i].weapons_ids;
                res_lines.push(line);

                /* Create Upgrade line for this weapon line */
                if (options.weapon_upgrades.value) {
                    var upgr_line = {};
                    upgr_line.attr_func = function (elem) {
                        elem.attr("stroke", "darkred").attr("opacity", "0.55");
                    }
                    upgr_line.DataObject = Researches;
                    upgr_line.items_ids = {};
                    upgr_line.height = 35;
                    upgr_line.parent_line = line;
                    var tmp_cnt = 0;
                    var res_class = weap_res_classes_array[i].res_class;
                    for (var ires in Researches.loaded_data) {
                        var res = Researches.loaded_data[ires];
                        if (Upgrades[player_all_researched].research_data != undefined)
                            if (Upgrades[player_all_researched].research_data[res.grid_id] != undefined)
                                if (Upgrades[player_all_researched].research_data[res.grid_id].weapon_res_class == res_class) {
                                    upgr_line.items_ids[res.grid_id] = 1;
                                    tmp_cnt++;
                                }
                    }
                    if (tmp_cnt > 0) {
                        res_lines.push(upgr_line);
                    }
                }
            }
        }
    }

    if (options.structures.value) {
        /* defenses line - bunkers */
        var line = {};
        line.DataObject = Structures;
        line.items_ids = {};
        for (var struc_id in Structures.loaded_data_hash) {
            var struc = Structures.loaded_data_hash[struc_id];
            if (can_research(struc_id)) {
                if (pushed_structs[struc_id] == undefined && struc.strength == "BUNKER") {
                    if (struc.type == "DEFENSE" || struc.type == "GENERIC") {
                        line.items_ids[struc_id] = 1;
                        pushed_structs[struc_id] = 1;
                    }
                }
            }
        }
        res_lines.push(line);
    }

    if (options.structures.value) {
        /* defenses line - hardpoints */
        var line = {};
        line.DataObject = Structures;
        line.items_ids = {};
        for (var struc_id in Structures.loaded_data_hash) {
            var struc = Structures.loaded_data_hash[struc_id];
            if (can_research(struc_id)) {
                if (pushed_structs[struc_id] == undefined && struc.name.indexOf("ardpoint") > 0) {
                    if (struc.type == "DEFENSE" || struc.type == "GENERIC") {
                        line.items_ids[struc_id] = 1;
                        pushed_structs[struc_id] = 1;
                    }
                }
            }
        }
        res_lines.push(line);
    }

    if (options.structures.value) {
        /* defenses line - sensors */
        var line = {};
        line.DataObject = Structures;
        line.items_ids = {};
        line.attr_func = function (elem) {
            elem.attr("stroke", "blue");
        }
        for (var struc_id in Structures.loaded_data_hash) {
            var struc = Structures.loaded_data_hash[struc_id];
            if (can_research(struc_id)) {
                if (pushed_structs[struc_id] == undefined && struc.sensorID != undefined && struc.weapons == undefined) {
                    line.items_ids[struc_id] = 1;
                    pushed_structs[struc_id] = 1;
                }
            }
        }
        res_lines.push(line);
    }

    if (options.structures.value) {
        /* defenses line - other */
        var line = {};
        line.DataObject = Structures;
        line.items_ids = {};
        for (var struc_id in Structures.loaded_data_hash) {
            var struc = Structures.loaded_data_hash[struc_id];
            if (can_research(struc_id)) {
                if (pushed_structs[struc_id] == undefined) {
                    if (struc.type == "DEFENSE" || struc.type == "GENERIC") {
                        line.items_ids[struc_id] = 1;
                        pushed_structs[struc_id] = 1;
                    }
                }
            }
        }
        res_lines.push(line);
    }
    return res_lines;
}

function DrawCompTimeTable(container_id, scale, options) {

    //1px = 1 sec
    if (scale == undefined) {
        scale = 1;
    }
    var sec_per_pixel = scale;
    var h = 2000;
    $('#' + container_id).html('<div id="timeTableSvgCanva"></div>');
    var max_res_time = 0;

    /* Distance between two vertical lines*/
    var vertical_lines_period_thin = 60; //pixels
    var vertical_lines_period_thick = 600; //pixels
    if (scale > 0.5 && scale < 0.9) {
        vertical_lines_period_thick = 300;
    } else if (scale <= 0.5) {
        vertical_lines_period_thick = 180;
    }

    /* Calculate maximum research time */
    for (var i in Researches.loaded_data) {
        var res_time = ResearchTime[player_all_researched][Researches.loaded_data[i].grid_id]
        if (res_time != undefined) {
            max_res_time = Math.max(res_time, max_res_time);
        }
    }

    /* Draw paper */
    var x_size = max_res_time * sec_per_pixel + 200;
    var y_size = 1151;
    var paper = new Raphael('timeTableSvgCanva', x_size, y_size);
    var x_offset = 100;
    var y_offset = 35;
    var line_space = 2;

    /* Create Research Lines - res lines*/
    var res_lines = CreateComponentsLines(options);

    var line_pos_y = y_offset;
    for (var line_num in res_lines) {
        var line = res_lines[line_num];
        line.min_time = 100 * 100;
        line.max_time = 0;
        if (line.height == undefined) {
            line.height = 50;
        }
        line.pos_y = line_pos_y;//line_num * line.height + y_offset;
        line_pos_y += line.height + line_space;
        line.drawn_elems = [];
        line.height_expected = line.height;
        line.res_time_periods = {};//stuff for collision detection
    }

    /* Collapse small lines into 1 line */
    var one_line = null;
    var final_lines_array = [];
    for (var line_num in res_lines) {
        var line = res_lines[line_num];
        var items_count = 0;
        for (var comp_id in line.items_ids) {
            items_count++;
        }
        if (items_count == 1) {
            if (one_line == null) {
                one_line = line;
                one_line.DataObject = null;
                one_line.color = "lightgray";
                final_lines_array.push(one_line);
            }else
            {
                //line collapsed
                for (var comp_id in line.items_ids) {
                    one_line.items_ids[comp_id] = 1;
                }
                //adjust y_coord of below lines
                for (var ln = parseInt(line_num) + 1; ln < res_lines.length; ln++) {
                    res_lines[ln].pos_y = res_lines[ln].pos_y - line.height_expected - line_space;
                }
            }
        } else {
            final_lines_array.push(line);
        }
    }
    res_lines = final_lines_array;

    
    var res_time_period = 15; //seconds

    /* Draw function for component icons */
    var DrawComponentIcon = function (line, res_id, comp_id) {
        var DataObject = line.DataObject;
        if (DataObject == null) {
            DataObject = FindDataObject(comp_id);
        }
        var height = 48;
        var width = 52;
        if (DataObject == Researches) {
            height = Math.floor(height * 0.7);
            width = Math.floor(width *0.7);
        }
        var comp = DataObject.loaded_data_hash[comp_id];
        var res_time = ResearchTime[player_all_researched][res_id];
        var elm_icon;
        var icon_x = res_time * sec_per_pixel + x_offset;
        var icon_y = line.pos_y;//+ line.height / 2;
        var drawn_elems = [];
        var icon_src = GetIcon_TryGetIcon(DataObject.icon_folder, comp);
        var has_icon = icon_src ? true : false;
        if (!has_icon && DataObject == Researches) {
            /* Try find icon for Research */
            var comp_res = Researches.loaded_data_hash[comp_id];
            if (comp_res.statID != undefined) {
                has_icon = GetIcon_CheckIconFilenameHashed(Researches.icon_folder, GetIcon_filename(comp_res.nameKey));
                if(has_icon)
                {
                    StatID_DataObject = FindDataObject(comp_res.statID);
                    if (StatID_DataObject != null) {  
                        icon_src = GetIcon_src(StatID_DataObject.icon_folder, comp_res.statID);
                    }
                }
            }
        }
        /* Draw image or rectangle */
        if (has_icon) {
            elm_icon = paper.image(icon_src, icon_x, icon_y, width, height).attr("alt", comp.name);
        } else {
            elm_icon = paper.rect(icon_x, icon_y, width, height).attr("title", comp.name).attr("fill", "gray");
            var txt_tmp = paper.text(icon_x, icon_y, comp.name);
            line.drawn_elems.push(txt_tmp);
            drawn_elems.push(txt_tmp);
        }
        drawn_elems.push(elm_icon);
        elm_icon.attr("title", comp.name + "\nResearch time: " + res_time.tohhMMSS())
        elm_icon.orig_form = elm_icon.transform(); // remember current transform
        elm_icon.comp = comp;
        elm_icon.DataObject = DataObject;
        elm_icon.hover(
            function () {
                //this.toFront(); - this line makes animation buggy in IE 10. 
                this.animate({ transform: "s1.3" }, 150, 'linear');
                this.toFront();
            },
            function () {
                this.animate({ transform: this.orig_form.toString() }, 150, 'linear');
            }
            );
        elm_icon.click(function () {
            if (this.DataObject.page_url != undefined) {
                window.open(this.DataObject.page_url + "?details_id=" + this.comp.grid_id);
            }
        });
        elm_icon.attr("cursor", "pointer");
        line.min_time = Math.min(line.min_time, res_time);
        line.max_time = Math.max(line.max_time, res_time);
        line.drawn_elems.push(elm_icon);

        /* Try resolve collisions */
        var res_period = Math.floor(res_time / res_time_period);
        if (line.res_time_periods[res_period] != undefined) {
            // (!) collision detected
            var coll_array = line.res_time_periods[res_period];
            for (var ia in coll_array) {
                coll_item = coll_array[ia];
                if (coll_item.res_id == res_id) {
                    //in this case collision will be resolved in another piece of code
                } else {
                    //..just need to draw element lower...
                    var y_offset = Math.floor(line.height/2) * coll_array.length;
                    for (var ielem in drawn_elems) {
                        var elem = drawn_elems[ielem];
                        var old_y = elem.attr("y");
                        var old_x = elem.attr("x");
                        elem.attr("x", old_x + 1).attr("y", old_y + y_offset).toBack();
                    }
                    line.height_expected = Math.max(line.height + y_offset, line.height_expected);
                    break;
                }
            }
            coll_array.push({
                comp_id: comp_id,
                res_id: res_id,
            });

        } else {
            line.res_time_periods[res_period] = [{
                comp_id: comp_id,
                res_id: res_id,
            }];
        }
        return elm_icon;
    }

    /* Draw researches which are included in Research Lines */
    for (var res_id in Researches.loaded_data_hash) {
        var research = Researches.loaded_data_hash[res_id];
        var result_comps = [];
        /* prepare array of research results */
        if (research.resultComponents != undefined) {
            result_comps = result_comps.concat(research.resultComponents);
        }
        if (research.resultStructures != undefined) {
            result_comps = result_comps.concat(research.resultStructures);
        }
        if (result_comps.length == 0 && (research.results == undefined || research.results=="")) {
            continue;
        }

        /* Filter out secondary VTOL weapons from research results (do not need to show both "Light Cannon" and "VTOL Light Cannon")*/
        var results_comp_lines = {};
        var result_final = [];
        for (var ir in result_comps) {
            var comp_id = result_comps[ir];
            if (!can_research(comp_id)) {
                continue;
            }
            for (var line_num in res_lines) {
                var line = res_lines[line_num];
                if (line.items_ids[comp_id] != undefined) {
                    if (line.DataObject == Weapons) {
                        if (results_comp_lines[line_num] == undefined) {
                            results_comp_lines[line_num] = [];
                            results_comp_lines[line_num].push(comp_id);
                        } else {
                            //found second weapon component in same line
                            var weapon = Weapons.loaded_data_hash[comp_id];
                            var abils = Weapon_GetAbilities(weapon);
                            if (abils.VTOLWeapon == true) {
                                //do nothing - we do not need this VTOL weapon, because we already have another weapon as result of current research
                            } else {
                                var new_weap_list = [];
                                new_weap_list.push(comp_id);
                                for (var iwep in results_comp_lines[line_num]) {
                                    var prev_comp_id = results_comp_lines[line_num][iwep];
                                    var prev_weapon = Weapons.loaded_data_hash[prev_comp_id];
                                    var prev_abils = Weapon_GetAbilities(prev_weapon);
                                    if (prev_abils.VTOLWeapon == true) {
                                        //previous component is VTOL weapon, and current component is non-VTOL weapon
                                        //we do not need this VTOL component
                                    } else {
                                        new_weap_list.push(prev_comp_id);
                                    }
                                }
                                results_comp_lines[line_num] = new_weap_list;
                            }
                        }
                    } else {
                        result_final.push(comp_id);
                    }
                    break;//component was found in research line. not need to search anymore
                }
            }
        }
        var weapon_results = [];
        for (var iline in results_comp_lines) {
            for (var iweap in results_comp_lines[iline]) {
                weapon_results.push(results_comp_lines[iline][iweap]);
            }
        }

        /* Re-order weapon components, to make cyborg weapon appear under main weapon */
        if (weapon_results.length > 1) {
            weapon_results.sort(function (a, b) {
                var a_weap = Weapons.loaded_data_hash[a];
                var b_weap = Weapons.loaded_data_hash[b];
                var a_val = Weapon_GetAbilities(a_weap).CyborgWeapon ? -1 : 1;
                var b_val = Weapon_GetAbilities(b_weap).CyborgWeapon ? -1 : 1;
                return a_val - b_val;
            });
        }
        result_comps = result_final.concat(weapon_results);
        result_comps.push(res_id); //current research item is also result of research..

        /* Draw research results  */
        var drawn_comps = {}; //components from one research which are belong to one line
        for (var ir in result_comps) {
            var comp_id = result_comps[ir];
            if (!can_research(comp_id)) {
                continue;
            }
            for (var line_num in res_lines) {
                var line = res_lines[line_num];
                if (line.items_ids[comp_id] != undefined) { //found component in research line
                    if (drawn_comps[line_num] == undefined)
                    {
                        var elem_icon = DrawComponentIcon(line, res_id, comp_id);
                        drawn_comps[line_num] = [elem_icon];
                    }else
                    {
                        //have collision - two or more components at 1 line at same time
                        var tmp_y_offset = 20;
                        for (var i_icon in drawn_comps[line_num]) {
                            var drawn_comp = drawn_comps[line_num][i_icon];
                            var old_x = drawn_comp.attr("x");
                            var old_y = drawn_comp.attr("y");
                            drawn_comp.attr("x", old_x + 3).attr("y", old_y + tmp_y_offset);
                        }
                        var elem_icon = DrawComponentIcon(line, res_id, comp_id);
                        drawn_comps[line_num].push(elem_icon);
                        line.height_expected = Math.max(line.height + tmp_y_offset * (drawn_comps[line_num].length -1),line.height_expected);
                    }
                }
            }
        }
    }

    /* Adjust lines y-coord, because some lines may use more space */
    var total_offset = res_lines[0].height_expected - res_lines[0].height;
    for(var line_num = 1; line_num < res_lines.length; line_num++)
    {
        var line = res_lines[line_num];
        if (total_offset != 0) {
            for (var elem_i in line.drawn_elems) {
                var elem = line.drawn_elems[elem_i];
                var old_y = elem.attr("y");
                elem.attr("y", old_y + total_offset);
            }
        }
        line.pos_y = line.pos_y + total_offset;
        total_offset += line.height_expected - line.height;
    }

    /* Resize paper */
    var y_offset_bottom = 50;
    var y_size = res_lines[res_lines.length - 1].pos_y + res_lines[res_lines.length - 1].height_expected + y_offset_bottom + line_space;
    //for (var line_num in res_lines) {
    //    y_size += line_space + res_lines[line_num].height_expected;
    //}
    //y_size = y_size + total_offset;
    paper.setSize(x_size, y_size);

    /* Draw time grid lines */
    var text_offset_y = 30 - 10;

    paper.text(x_offset - 50, text_offset_y, "Timeline");
    paper.path("M30 30L" + x_size + " 30");

    var bottom_timeline_y = y_size - y_offset_bottom;
    var y_lines_max = y_size - 45;
    paper.text(x_offset - 50, bottom_timeline_y + 7, "Timeline");
    paper.path("M30 " + bottom_timeline_y + "L" + x_size + " " + bottom_timeline_y);
    for (var i = 0; i <= x_size; i = i + vertical_lines_period_thin) {
        var x = i + x_offset;
        var time = Math.floor(i / sec_per_pixel); //time in seconds
        var y0 = y_offset - 25;
        if (i % vertical_lines_period_thick == 0) {
            paper.path("M" + x + " " + y0 + "L" + x + " " + y_lines_max).attr("stroke-width", "2").toBack();
            paper.text(x, text_offset_y, time.tohhMMSS()).attr("font-weight", "bold").toBack();
            paper.text(x, bottom_timeline_y + 7, time.tohhMMSS()).attr("font-weight", "bold").toBack();
        } else {
            paper.path("M" + x + " " + y0 + "L" + x + " " + y_lines_max).attr("opacity", 0.7).toBack();
            paper.text(x, text_offset_y, time.tohhMMSS()).toBack();
            paper.text(x, bottom_timeline_y + 7, time.tohhMMSS()).toBack();
        }
    }


    /* Draw hotizontal connection lines */
    for (var line_num in res_lines) {
        var line = res_lines[line_num];
        var y = line.pos_y + line.height/2;
        var x1 = line.min_time * sec_per_pixel + x_offset;
        var x2 = line.max_time * sec_per_pixel + x_offset;
        var line_elem;
        if (line.parent_line == undefined) {
            line_elem = paper.path("M" + x1 + " " + y + "L" + x2 + " " + y);
        } else {
            parent_line = line.parent_line;
            var x0 = parent_line.min_time * sec_per_pixel + x_offset;
            var y0 = parent_line.pos_y + parent_line.height / 2;
            var path2 = [["M", x0, y0], ["C", x0+60, y0, x0-5, y, x1, y], ["L", x2, y]];
            line_elem = paper.path(path2);
        }
        line_elem.attr("stroke-width", "2.2").toBack();
        if (line.attr_func == undefined) {
            line_elem.attr("stroke", "darkgreen");
        } else {
            line.attr_func(line_elem);
        }
    }

}

Raphael.fn.connection = function (obj1, obj2, line, bg) {
    //var color = line;
    //var path = [["M", obj1.attr("x"), obj1.attr("y")], ["L", obj2.attr("x"), obj2.attr("y")]];
    //return {
    //    line: this.path(path).attr({ stroke: color }),
    //    from: obj1,
    //    to: obj2
    //};

    if (obj1.line && obj1.from && obj1.to) {
        line = obj1;
        obj1 = line.from;
        obj2 = line.to;
    }
    var bb1 = obj1.getBBox(),
        bb2 = obj2.getBBox(),
        p = [{ x: bb1.x + bb1.width / 2, y: bb1.y - 1 },
        { x: bb1.x + bb1.width / 2, y: bb1.y + bb1.height + 1 },
        { x: bb1.x - 1, y: bb1.y + bb1.height / 2 },
        { x: bb1.x + bb1.width + 1, y: bb1.y + bb1.height / 2 },
        { x: bb2.x + bb2.width / 2, y: bb2.y - 1 },
        { x: bb2.x + bb2.width / 2, y: bb2.y + bb2.height + 1 },
        { x: bb2.x - 1, y: bb2.y + bb2.height / 2 },
        { x: bb2.x + bb2.width + 1, y: bb2.y + bb2.height / 2 }],
        d = {}, dis = [];
    for (var i = 0; i < 4; i++) {
        for (var j = 4; j < 8; j++) {
            var dx = Math.abs(p[i].x - p[j].x),
                dy = Math.abs(p[i].y - p[j].y);
            if ((i == j - 4) || (((i != 3 && j != 6) || p[i].x < p[j].x) && ((i != 2 && j != 7) || p[i].x > p[j].x) && ((i != 0 && j != 5) || p[i].y > p[j].y) && ((i != 1 && j != 4) || p[i].y < p[j].y))) {
                dis.push(dx + dy);
                d[dis[dis.length - 1]] = [i, j];
            }
        }
    }
    if (dis.length == 0) {
        var res = [0, 4];
    } else {
        res = d[Math.min.apply(Math, dis)];
    }
    var x1 = p[res[0]].x,
        y1 = p[res[0]].y,
        x4 = p[res[1]].x,
        y4 = p[res[1]].y;
    dx = Math.max(Math.abs(x1 - x4) / 2, 10);
    dy = Math.max(Math.abs(y1 - y4) / 2, 10);
    var x2 = [x1, x1, x1 - dx, x1 + dx][res[0]].toFixed(3),
        y2 = [y1 - dy, y1 + dy, y1, y1][res[0]].toFixed(3),
        x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][res[1]].toFixed(3),
        y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][res[1]].toFixed(3);
    var path = ["M", x1.toFixed(3), y1.toFixed(3), "C", x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)].join(",");
    if (line && line.line) {
        line.bg && line.bg.attr({ path: path });
        line.line.attr({ path: path });
    } else {
        var color = typeof line == "string" ? line : "#000";
        return {
            bg: bg && bg.split && this.path(path).attr({ stroke: bg.split("|")[0], fill: "none", "stroke-width": bg.split("|")[1] || 3 }),
            line: this.path(path).attr({ stroke: color, fill: "none" }),
            from: obj1,
            to: obj2
        };
    }
};

function show_short_res_table(container_id, grid_data)
{
    var grid_element_id = ResetGridContainer(container_id);
    var grid = $(grid_element_id);
    grid.jqGrid
    ({
        datatype: "local",
        data: grid_data,
        rowNum: grid_data.length,
        height: 'auto',
        colModel:
            [
                { label: "", name: "grid_id", key: true, hidden: true },
                {
                    label: " ",
                    name: 'pic',
                    width: '65px',
                    sortable: false,
                    search: false,
                    formatter: function (cellvalue, options, rowObject) {
                        return '<a href="research.html?details_id=' + rowObject.grid_id + '" onclick="ShowResearchDetails(\'' + rowObject.grid_id + '\'); return false;">' + Researches.GetIconHtml_Function(rowObject) + '</a>';
                    },
                },
                {
                    label: " ", name: "name",
                    formatter: function (cellvalue, options, rowObject) {
                        return '<a href="research.html?details_id=' + rowObject.grid_id + '" onclick="ShowResearchDetails(\'' + rowObject.grid_id + '\'); return false;">' + cellvalue + '</a>';
                    },
                },

                {
                    label: "Price",
                    formatter: function (cellvalue, options, rowObject) {
                        return rowObject.researchPower == undefined ? 0 : rowObject.researchPower;
                    },
                    width: 70,
                },
                {
                    label: "Research Points",
                    formatter: function (cellvalue, options, rowObject) {
                        return rowObject.researchPoints == undefined ? 0 : rowObject.researchPoints;
                    },
                    width: 70,
                },

                {
                    label: "Min research time",
                    name: "minResearchTime",
                    width: 80,
                    sorttype: "int",
                    formatter: function (cellvalue, options, rowObject) {
                        if (cellvalue != undefined) {
                            if (cellvalue < 3600) {
                                return cellvalue.toMMSS();
                            } else {
                                return cellvalue.toHHMMSS();
                            }
                        }
                        return ' - ';
                    },
                },
            ],
        loadonce: true,
    });
}
