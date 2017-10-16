/**
	只是定義了接口規範  如果有大量重複代碼,將會考慮提取很多代碼出來

*/
function NSEntity()
{
	function Entity(obj,offset,anchorPer)
	{
		this.type = window.PG.ENTITY;
	}
	PG.Entity = Entity;

	/**
		初始化		
	*/
	PG.Entity.Init = function(map)
	{
		
	};

	/**
		返回容器		
	*/
	PG.Entity.GetObject = function(){return this.div;};

	/**
		重新繪製		
	*/
	PG.Entity.reDraw = function( booleans )
	{
		
	};

	/**
		刷新		
	*/
	PG.Entity.Refresh = function( booleans ){
		this.reDraw();
	};
	
	/**
		設置可見		
	*/
	PG.Entity.setVisible = function( booleans )
	{
		this.div.style.display=booleans?"":"none";
	};

	/**
		得到可見性		
	*/
	PG.Entity.getVisible = function()
	{
		return this.div.style.display!="none";
	};

	/**
		隱藏		
	*/
	PG.Entity.Hide = function(){
		this.setVisible(false);
	};
	
	/**
		設置可見		
	*/
	PG.Entity.Show = function(){
		this.setVisible(true);
	};

	/**
		是否隱藏		
	*/
	PG.Entity.IsHidden = function(){
		return this.getVisible();
	};

	/**
		刪除		
	*/
	PG.Entity.Remove = function()
	{
		
	};
	
	/**
		啟動編輯		
	*/
	PG.Entity.EnableEdit = function(){
		
	};

	/**
		禁止編輯		
	*/
	PG.Entity.DisableEdit = function(){
		
	};

	/**
		是否可編輯		
	*/
	PG.Entity.IsEditable = function(){
		
	};

	/**
		銷毀--每個子類實現的方法		
	*/
	PG.Entity.depose = function()
	{
		
	};

	/**
		銷毀---對外公開的方法	
	*/
	PG.Entity.Dispose = function()
	{
		this.depose();
	};

	window.PG.Entity = PG.Entity;
}
NSEntity();