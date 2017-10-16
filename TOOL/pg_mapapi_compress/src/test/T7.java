package test;

import java.util.Comparator;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class T7 {
	
	private static String[] MapsGroup=new StringBuffer()	
	.append("Icon,DivIcon,Entity,WindowEntity,PointEntity,MarkEntity,PolyLineEntity,")
	.append("PolygonEntity,RectEntity,EllipseEntity,CircleEntity,Control,ScaleControl,")
	.append("HtmlElementControl,LogoControl,MapControl,ZoomInTool,ProgressControl,")
	.append("RectTool,EllipseTool,CircleTool,MarkTool,PolyLineTool,PolygonTool,")
	.append("MapTile,MapTileMgr,OverviewMapControl,OverviewMap,")
	.append("MapEffect,BseiDigControl,Layer256Overlay,MapTypeControl,")
	.append("TileLayer,MapShadow,IconShadow,MagnifyingglassControl,MapType,")
	.append("CenterCrossControl,EdittingMPolyLine,WindowEntityTab,ContextMenu,")
	.append("MenuItem,CopyrightControl,Map,")
	.append("Event,ObjectLoader,Ajax,Tool,BrowserInfo,Geo,Point,Rect,")
	.append("Polyline,PolygonSet,Polygon,Size,")
	.toString().split(",");
	//private static final String[] AJAXGroup="Event,ObjectLoader,Ajax,Tool,BrowserInfo,Geo,Point,Rect,Polyline,Polygon,PolygonSet,Size".split(",");
	
	/*
	 * 处理名字空间点号
	 * */
	@SuppressWarnings("unchecked")
	private static void sortMapsGroup() throws Exception {		
		java.util.Arrays.sort(MapsGroup, new Comparator(){

			/* (non-Javadoc)
			 * @see java.util.Comparator#compare(java.lang.Object, java.lang.Object)
			 */
			@Override
			public int compare(Object o1, Object o2) {
				// TODO Auto-generated method stub
				int a = o1.toString().length();
				int b = o2.toString().length();				
				return a>b?-1:(a==b?0:1);
			}		
			
		});
	}
	
	private static String toString99(){	
		StringBuilder sb=new StringBuilder();
		for (int i = 0; i < MapsGroup.length; i++) {
			sb.append(MapsGroup[i]).append(",");
			
		}
		return sb.toString();
	}

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		
				
		System.out.println(java.util.Arrays.toString(MapsGroup));
		
		try {
			T7.sortMapsGroup();
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		System.out.println(java.util.Arrays.toString(MapsGroup));

	}

}
