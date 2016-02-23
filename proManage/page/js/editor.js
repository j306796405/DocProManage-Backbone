(function($){
	$.fn.editor = function(){

		var _this = this,
			id = this.attr('id');

		var linkConfir = id+'_linkConfir',
			linkCancel = id+'_linkCancel',
			linkTitle = id+'_linkTitle',
			link = id+'_link',
			insertLink = id+'_insertLink';

		var html = '<span class="linkBar">&emsp;<lable>标签&ensp;<input type="text" id="'+linkTitle+'"></lable>&emsp;<lable>链接&ensp;<input type="text" id="'+link+'"></lable>&emsp;<button id="'+linkConfir+'">确认</button>&ensp;<button id="'+linkCancel+'">取消</button></span>'

		var $linkBtn = $('<span id="'+insertLink+'" class="glyphicon glyphicon-link" title="添加链接"></span>');

		_this.attr('contenteditable','true');

		$linkBtn.on('click',function(){
			var $this = $(this);
			if(!$this.attr('onOff')){
				$this.after(html);
				$this.attr('onOff','on')
			}
			$('#'+linkConfir).on('click', function(){
				var cont = '<div><span>'+$('#'+linkTitle).val()+'</span>：<a target="_blank" href="'+$('#'+link).val()+'">'+$('#'+link).val()+'</a></div>';
				_this.append(cont);
				$('#'+linkTitle).val('');
				$('#'+link).val('');
			})

			$('#'+linkCancel).on('click', function(e){
				$(e.target).parent().remove();
				$linkBtn.attr('onOff','');
			})
		});

		return this.before($linkBtn);
	}
})(jQuery)