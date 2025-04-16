class TestDatabaseOperations(unittest.TestCase):
    def test_video_approval_workflow(self):
        # 测试视频审核流程
        test_video = Video(title="测试视频", src="test.mp4")
        session.add(test_video)
        session.commit()
        
        # 模拟用户评分
        submit_rating(test_video.id, 7, 8)
        submit_rating(test_video.id, 6, 7)
        
        # 触发自动审核
        check_approval_rules()
        approved = session.query(Video.is_approved).filter_by(id=test_video.id).scalar()
        self.assertTrue(approved)