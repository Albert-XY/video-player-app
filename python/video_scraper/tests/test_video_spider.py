def test_video_spider():
    spider = VideoSpider()
    
    # 测试解析逻辑
    fake_response = fake_response_from_file('sample_page.html')
    results = list(spider.parse(fake_response))
    
    # 验证数据格式
    assert len(results) > 0
    item = results[0]
    assert item['title'] is not None
    assert 'mp4' in item['video_url']
    assert 0 <= item['duration'] <= 600