(function(w,$){
// 加载模板
    $.ajax({
        url : 'template.html',
        dataType : 'html'
    }).done(function(html){
           renderTemplate(html, function(){
               app.models.ItemModel = Backbone.Model.extend({
                   urlRoot : map_path + '/item'
               });

               app.models.PagingModel = Backbone.Model.extend({
                   url : map_path + '/paging',
                   setPages: function(){
                       this.set('pages', Math.ceil(this.get('count') / app.pagingNum));
                       return this;
                   },
                   initialize: function(){
                       this.on('change:count', this.setPages);
                   }
               });

               app.models.pagingModel = new app.models.PagingModel({count: 0,page: 1,pages: 1,keyword: ''});

               app.models.HeaderModel = Backbone.Model.extend({

               })
               app.models.headerModel = new app.models.HeaderModel({});

               // 数据集合
               app.collections.ListCollection = Backbone.Collection.extend({
                   model : app.models.ItemModel,
                   url : map_path + '/list',
                   initialize :  function(){

                   }
               });

               app.collections.listCollection = new app.collections.ListCollection();

               app.collections.LinkCollection = Backbone.Collection.extend({

               });

               app.collections.linkCollection = new app.collections.LinkCollection([
                   { hash:'#addItem' , title:'创建项目' , ico:'ico-plus' , pageTitle:'项目列表' , pageLink: '#list/1' },
                   { hash:'#addItem' , title:'创建项目' , ico:'ico-plus' , pageTitle:'项目列表' , pageLink: '#list/1' },
                   { hash:'#addItem' , title:'创建项目' , ico:'ico-plus' , pageTitle:'项目列表' , pageLink: '#list/1' },
               ])

               app.views.HeaderView = Backbone.View.extend({
                   el: '#base_hd',
                   template: $.tpl['header'],
                   render: function(){
                       console.log('render header');

                       this.$el.empty().html(this.template(this.model));
                       return this;
                   }
               })

               // 列表页
               app.views.ListView = Backbone.View.extend({
                   el: '#base_bd',
                   template: $.tpl['list'],
                   initialize : function(){
                       this.listenTo(this.model, 'change:count', this.renderTotalCounts);
                       this.listenTo(this.model, 'change:keyword', this.updateKeyword);
                   },
                   render : function(){
                       console.log('render list view');
                       this.$el.empty().html(this.template(this.model.toJSON()));
                       if(!app.views.listDataView && !app.views.pagingView){
                           app.views.listDataView = new app.views.ListDataView({model: this.model, collection: app.collections.listCollection}).render();
                           app.views.pagingView = new app.views.PagingView({model: this.model}).render();
                       }
                       this.$el.find('.list-table').append(app.views.listDataView.el);
                       this.renderTotalCounts();
                       return this;
                   },
                   renderTotalCounts: function(){
                       this.$el.find('#totalCount').empty().html(app.models.pagingModel.get('count'));
                   },
                   events : {
                       "keyup #searchBox"  :  'search'
                   },
                   search: function(){
                       app.routers.appRouter.navigate("list/1");
                       var keyword = $.trim(this.$el.find('#searchBox').val());
                       app.models.pagingModel.set({keyword: keyword, page: 1});
                   },
                   updateKeyword: function(){
                       this.$el.find('#searchBox').val(app.models.pagingModel.get('keyword'));
                   }
               });

               app.views.ListDataView = Backbone.View.extend({
                   tagName: 'tbody',
                   template: $.tpl['listData'],
                   initialize: function(){
                       //this.listenTo(this.collection, 'reset', this.render);
                       this.listenTo(this.model, 'change:keyword', this.searchByKeyword);
                   },
                   render: function(){
                       console.log('render list data view');
                       $(this.el).empty().html(this.template({items: this.collection.toJSON()}));
                       this.delegateEvents();
                       return this;
                   },
                   events: {
                     'click .operator': 'serachByOperator'
                   },
                   searchByKeyword: function(){
                       var keyword = app.models.pagingModel.get('keyword'),
                           page = app.models.pagingModel.get('page'),
                           _this = this;
                       this.collection.fetch({
                           //搜索关键字， 当前页码， 1页多少条数据
                           data: {keyword: keyword, currentPage: page, pageSize: app.pagingNum},
                           success: function(collection, res){
                               _this.render();
                           }
                       });
                   },
                   serachByOperator: function(e){
                       var $this = $(e.srcElement ? e.srcElement : e.target);
                       app.models.pagingModel.set({keyword: $this.text(), page: 1});
                   }
               })

               app.views.PagingView = Backbone.View.extend({
                   //el: '#paging',
                   initialize: function(){
                       this.listenTo(this.model, 'change:keyword', this.render);
                   },
                   render: function(){
                       console.log('render paging view');
                       var keyword = app.models.pagingModel.get('keyword'),
                           _this = this;

                       app.models.pagingModel.fetch({
                           data: {keyword: keyword},
                           success: function (model, res) {
                               $('#paging').pagination({
                                   pages: _this.model.get('pages'),
                                   cssStyle: 'light-theme',
                                   displayedPages: 3,//开始的页码数量
                                   edges: 2, //两边的页码数量
                                   hrefTextPrefix: '#list/',
                                   currentPage: _this.model.get('page')
                               });
                           }
                       })
                       return this;
                   }
               })

               // 详情页
               app.views.DetailView = Backbone.View.extend({
                   el : '#base_bd',
                   template: $.tpl['detail'],
                   viLinks: [],
                   viewCaches: [],
                   initialize : function(){

                   },
                   render : function(){
                       console.log('rendering detail!');

                       //遍历views数组，并对每个view调用Backbone的remove
                       _.each(this.viewCaches,function(view){
                           view.remove().off();
                       })
                       this.viewCaches =[];
                       this.$el.empty();
                       if(!this.model.get('viLink')){
                           this.viLinks = [];
                       }else{
                           this.viLinks = this.model.get('viLink');
                       }

                       var item = this.model.toJSON();
                       item.proTypeIcon = app.proTypeIcon[this.model.get('proClass')];
                       this.$el.empty().html(this.template({item : item}));
                       app.views.uploadView = new app.views.UploadView({viLinks: this.viLinks, $parentNode: this.$el.find('#uploadBox'), opts: {isEdit: false} }).render();
                       this.viewCaches.push(app.views.uploadView);

                       for(var i= 0; i< this.viLinks.length; i++){
                           this.viLinks[i].isEdit = false;
                           this.viLinks[i].thumbnail = app.util.uploadThumbnail(this.viLinks[i].name, this.viLinks[i].path);
                           var uploadEditDataView = new app.views.UploaEditDataView({viLinks: this.viLinks, viLink: this.viLinks[i]}).render();
                           this.$el.find('#editVI').append(uploadEditDataView.el);
                           this.viewCaches.push(uploadEditDataView);
                       }
                       return this;
                   },
                   events :  {
                       // 编辑文本数据
                       "click .edit": "editTxt",
                       "click .save": "saveTxt",
                       // 编辑项目成员
                       "click .editPerson": "editPerson",
                       "click .savePerson": "savePerson",
                       // 编辑视觉稿
                       "click .editVI": "editVI",
                       "click .saveVI": "saveVI"
                   },
                   editPerson : function(){
                       var $content = $('#'+event.target.getAttribute('data-target'));
                       $('span',$content).attr('contenteditable','true');
                       $('.c-radio',$content).prop('disabled',false);
                   },
                   savePerson : function(){
                       var key = event.target.getAttribute('data-target'),
                           $content = $('#'+key);
                       var updateData = this.model.get('person');
                       $('span',$content).each(function(key){
                           var $this = $(this);
                           updateData[key]['value'] = $this.text();
                           updateData[key]['isOperator'] = $this.next('.c-radio').prop('checked');
                       })
                       this.updateAndRender(key,updateData);
                   },
                   editTxt  :  function(event){
                       var $content = $('#'+event.target.getAttribute('data-target')),
                           $id = $content.attr('id');

                       if(!$content.attr('state')){
                           if($id == 'proDes' || $id == 'repository' || $id == 'proName' || $id == 'cp4'){
                               if($id == 'proName'){
                                   $('.tags-wrap').hide();
                                   $('.tags-edit-wrap').removeClass('hidden');
                               }
                               $content.attr('contenteditable','true');
                           }else{
                               $content.editor();
                           }
                           $content.attr('state','onEdit');
                       }
                   },
                   saveTxt : function(event){
                       var key = event.target.getAttribute('data-target');
                       var updateData = $('#'+key).html();
                       if(key === 'proName'){
                           var tagsId = 'tag';
                           this.updateAndRender(tagsId,_.map($('input:checked','#' + tagsId),function(input){
                               return input.getAttribute('data-value');
                           }));
                       }
                       this.updateAndRender(key,updateData);
                       event.target.setAttribute('state','');
                   },
                   editVI : function(e){
                       var $this = $(e.srcElement ? e.srcElement : e.target);
                       $('.glyphicon-remove','#viLink').css('display','inline-block');
                       $this.closest('.itemInfo').find('#uploadifive-files,.viBox .glyphicon-remove').removeClass('hidden');
                   },
                   saveVI : function(){
                       this.updateAndRender('viLink',this.viLinks);
                   },
                   updateAndRender : function($key,updateData){
                       var _this =this;
                       if(_.isArray(updateData) && updateData.length == 0){
                           updateData = null;
                       }
                       console.log('updating');
                       this.model.save($key,updateData,{
                           patch: true, wait: true,
                           success: function(model, res){
                               _this.render();
                           }
                       })
                   }
               });

               // 填写页
               app.views.AddView = Backbone.View.extend({
                   el : '#base_bd',
                   template: $.tpl['add'],
                   viLinks: [],
                   isInitialize: false,
                   initialize: function(){

                   },
                   render : function(){
                       console.log('render add page!');

                       this.$el.empty().html(this.template({}));
                       this.$el.find('#editPicsLink').editor();
                       this.$el.find('#editCssLink').editor();
                       this.$el.find('#editLowfiLink').editor();
                       this.initValidate();

                       if(app.views.uploadView){
                           app.views.uploadView.remove().off();
                           this.viLinks = [];
                       }
                       app.views.uploadView = new app.views.UploadView({viLinks: this.viLinks, $parentNode: this.$el.find('#uploadBox'), opts: {isEdit: true} }).render();

                       return this;
                   },
                   initValidate: function(){
                       var _this = this;
                       $("#add-form").validate({
                           submitHandler:function() {
                               //debugger;
                               //_this.saveModel();
                               $('#addItemBtn').off().one('click', function(){
                                   _this.saveModel();
                               })
                           },
                           errorPlacement: function(error, element) {
                               error.addClass('errMsg errMsg-active');
                               element.parents('.form-item-box').after(error);
                           }
                       });
                   },
                   events  :  {
                       //"click #addItemBtn" :  "saveModel"
                   },
                   saveModel   :  function(){
                       //item info
                       var tagArr = [],
                           ueder = [],
                           proClass = $('#proClass').val(),
                           $picsLink = $('#editPicsLink').html() || '无',
                           $uiLink = $('#editLowfiLink').html() || '无',
                           $cp4Link = $('#dataCP4').html() || '无',
                           $proNameVal = $('#editProName').val() || '无',
                           $cssLink = $('#editCssLink').html() || '无',
                           $proDes = $('#editDes').html() || '无',
                           $submitTimeVal = new Date(), //忽略 以服务器时间为准
                           $repositoryVal = $('#editRepository').html() || '无',
                           viLinkArr = this.viLinks;
                       _.map($('input','#tags'),function(input){
                           if(input.checked)
                               tagArr.push(input.getAttribute('data-value'));
                       });
                       _.map($('.form-control','#editPerson'),function(input){
                           var data = {},
                               $input = $(input);
                           data.group = $input.data('group');
                           data.value = $input.val();
                           if($input.siblings('.c-radio').prop('checked')){
                               data.isOperator = true;
                           }else{
                               data.isOperator = false;
                           }
                           ueder.push(data);
                       });
                       var itemModel = new app.models.ItemModel({
                           'proName' : $proNameVal,
                           'cp4': $cp4Link,
                           'person' : ueder,
                           'proDes' : $proDes,
                           'submitTime' : $submitTimeVal,
                           'repository' : $repositoryVal,
                           'lowfiLink' : $uiLink,
                           'viLink' : viLinkArr,
                           'cssLink' : $cssLink,
                           'picsLink' : $picsLink,
                           'proClass' : proClass,
                           'tag' : tagArr
                       });
                       event.preventDefault();
                       app.collections.listCollection.create(itemModel,{
                           success:function(model,response){
                               w.location.hash = '#item/'+response.id;
                           }
                       })
                   }
               });

               app.views.UploadView = Backbone.View.extend({
                   tagName: 'div',
                   render: function(){
                       this.template = $.tpl['upload'];
                       this.$el.empty().html(this.template({}));
                       this.options.$parentNode.empty().html(this.el);
                       this.initializeUpload();
                       return this;
                   },
                   initializeUpload: function(){
                       var _this = this;
                       var viLinksObj = _this.options.viLinks;

                       var $fileSelect = this.$('#files');
                       $fileSelect.uploadifive({
                           'queueID': 'editVI',
                           'uploadScript': map_path + '/upload',
                           'itemTemplate': $.tpl['uploadCreateData'],
                           'buttonText': '上传文件',
                           'fileSizeLimit' : 200000,
                           //'dropTarget': '#editVI',
                           onInit: function(){
                               if(!_this.options.opts.isEdit){
                                   _this.$('#uploadifive-files').addClass('hidden');
                               }
                           },
                           'onUploadComplete': function (file, data) {
                               var dataObj = JSON.parse(data)[0],
                                   fileName = dataObj.name,
                                   filePath = dataObj.path,
                                   fileThumbnail = app.util.uploadThumbnail(fileName, dataObj.path),
                                   pic = {
                                       $item: file.queueItem,
                                       name: fileName,
                                       path: filePath,
                                       isEdit: true,
                                       thumbnail: fileThumbnail
                                   }
                               for(var i= 0; i< viLinksObj.length; i++){
                                   var item = viLinksObj[i];
                                   if(item.name == fileName){
                                       item.path = filePath;
                                   }
                               }
                               new app.views.UploaEditDataView({viLink: dataObj,viLinks: viLinksObj, pic: pic}).render();
                           },
                           'onAddQueueItem' : function(file) {
                               var name = file.name,
                                   queueItem = file.queueItem;
                               if(!app.util.uploadExtCheck(name)){
                                   $(this).uploadifive('cancel', queueItem.data('file'));
                                   queueItem.remove();
                               }else{
                                   viLinksObj.push({name: name});
                               }
                           }
                       });
                   }
               })

               app.views.UploaEditDataView = Backbone.View.extend({
                   tagName: 'div',
                   className: 'viBox editItem',
                   initialize: function(){
                       _.bindAll(this, 'removeVI');
                   },
                   render: function(){
                       this.template = $.tpl['uploadEditData'];

                       if(this.options.pic){
                           this.$el.append(this.template(this.options.pic));
                           this.options.pic.$item.after(this.el).remove();
                       }else{
                           this.$el.append(this.template(this.options.viLink));
                       }
                       return this;
                   },
                   events: {
                       'click .glyphicon-remove': 'removeVI'
                   },
                   removeVI: function(e){
                       var $this = $(e.srcElement ? e.srcElement : e.target),
                           path = $this.data('path'),
                           _this = this;
                       $.ajax({
                           url : map_path + '/deletePic/',
                           type : 'delete',
                           data: 'imgPath=' + path
                       }).success(function(data){
                           _this.options.viLinks = app.util.sliceViLinks(_this.options.viLinks,_this.options.viLink);
                           _this.$el.remove();
                       })
                   }
               })

               app.views.ReportView = Backbone.View.extend({
                   'el': '#base_bd',
                   template: $.tpl['report'],
                   reportColor: {
                       Mobile: '#ee6767',
                       Offline: '#00b4f7',
                       Online: '#56cd86',
                       物料: '#f4b327'
                   },
                   option: {
                       title : {
                           /*text: '酒店UED项目文档管理',
                            subtext: '纯属虚构'*/
                       },
                       color: [
                           '#ff7f50', '#87cefa', '#da70d6', '#32cd32', '#6495ed',
                           '#ff69b4', '#ba55d3', '#cd5c5c', '#ffa500', '#40e0d0',
                           '#1e90ff', '#ff6347', '#7b68ee', '#00fa9a', '#ffd700',
                           '#6b8e23', '#ff00ff', '#3cb371', '#b8860b', '#30e0e0'
                       ],
                       tooltip : {
                           trigger: 'axis'
                       },
                       legend: {
//			data:['变更','团队','项目']
                           data: []
                       },
                       toolbox: {
                           show : true,
                           feature : {
                               dataView : {show: true, readOnly: false},
                               restore : {show: true},
                               saveAsImage : {show: true}
                           }
                       },
                       calculable : true,
                       xAxis : [
                           /*{
                            type : 'category',
                            data : ['2015-01','2015-02','2015-03','2015-04','2015-05','2015-06','2015-07','2015-08','2015-09','2015-10','2015-11','2015-12']
                            }*/
                       ],
                       yAxis : [
                           {
                               type : 'value'
                           }
                       ],
                       series : [
                           /*{
                            name:'变更',
                            type:'bar',
                            data:[2, 5, 9, 26, 28, 39, 33, 31, 22, 10, 6, 2],
                            itemStyle: { normal: { label: { show: true, position: 'top'}}}
                            },
                            {
                            name:'团队',
                            type:'bar',
                            data:[2, 5, 9, 26, 28, 39, 33, 31, 22, 10, 6, 2],
                            itemStyle: { normal: { label: { show: true, position: 'top'}}}
                            },
                            {
                            name:'项目',
                            type:'bar',
                            data:[2, 4, 7, 23, 25, 34, 23, 12, 32, 20, 6, 3],
                            itemStyle: { normal: { label: { show: true, position: 'top'}}}
                            }*/
                       ]
                   },
                   myChart: null,
                   render: function(){
                       var _this = this,
                           currentDate = new Date(),
                           currentMonth = currentDate.getMonth(),
                           quarterStartMonth = app.util.getQuarterStartMonth(currentMonth),
                           o_date = this.getYearMonthDay(currentDate.getFullYear(), quarterStartMonth, 1),
                           o_quarterDate = this.getYearMonthDay(currentDate.getFullYear(), currentMonth, currentDate.getDate());
                       //默认显示当前季度
                       this.$el.empty().html(this.template({
                           startDate: o_date.year + '-' + o_date.month + '-01',
                           endDate: o_quarterDate.year + '-' + o_quarterDate.month +'-' + o_quarterDate.day
                       }));

                       $(function(){
                           require.config({
                               paths: {
                                   echarts: 'http://echarts.baidu.com/build/dist'
                               }
                           });
                           require(['echarts', 'echarts/chart/bar'], function(ec){
                               _this.myChart = ec.init($('#main')[0]);
                               //默认执行当月图标查询
                               _this.search();
                           });

                           $('.form_date').datetimepicker({
                               weekStart: 1,
                               todayBtn:  1,
                               autoclose: 1,
                               todayHighlight: 1,
                               startView: 2,
                               minView: 2,
                               forceParse: 0
                           });

                       })
                   },
                   events: {
                       'click #btn-search': 'search'
                   },
                   getYearMonthDay: function(year, month, day){
                       var month = month + 1,
                           month = app.util.prefixZeroDate(month),
                           day = app.util.prefixZeroDate(day);
                       return {
                           year: year,
                           month: month,
                           day: day
                       }
                   },
                   search: function(){
                       $.ajax({
                           type: "get",
                           url: "report",
                           context: this,
                           data: $('.echarts-filter-box').serialize(),
                           success: function(ajaxData){
                               this.updateEcharts(ajaxData);
                           }
                       });
                   },
                   //通过ajax数据动态更新echarts option
                   updateEcharts: function(ajaxData){
                       var _this = this;
                       this.option.xAxis = [],
                           this.option.legend.data = [],
                           this.option.series = [];
                       this.option.xAxis.push({
                           type: 'category',
                           data: ajaxData.xData
                       })
                       var eachIndex = 0;
                       $.each(ajaxData.yData, function(k, v){
                           var item = {};
                           item.name = k;
                           item.type = 'bar';
                           item.data = v;
                           item.itemStyle = { normal: { label: { show: true, position: 'top'}}};
                           _this.option.series.push(item);
                           _this.option.legend.data.push({name: k});
                           if(_this.reportColor[k]){
                               //设置业务线相关固定颜色
                               _this.option.color[eachIndex] = _this.reportColor[k];
                           }
                           eachIndex++
                       })
                       this.myChart.clear();
                       this.myChart.setOption(this.option);
                   }
               })

               app.routers.appRouter = new app.routers.AppRouter();
               Backbone.history.start();
           })
        });
    // render模板
    function renderTemplate(html, fn){
        $('head').append(html);
        $.tpl = {};

        $('script.backboneTemplate').each(function(index) {
            var $this = $(this);
            $.tpl[$this.attr('id')] = _.template($this.html());
            $this.remove();
        });

        $('script.template').each(function(index) {
            var $this = $(this);
            $.tpl[$this.attr('id')] = $this.html();
            $this.remove();
        });

        fn();
    }



})(window,jQuery)
  
