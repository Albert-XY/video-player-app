from setuptools import setup, find_packages

setup(
    name="video_scraper",
    version="0.1",
    packages=find_packages(),
    install_requires=[
        'scrapy>=2.11.0',
        'numpy>=1.24.3',
        'scikit-learn>=1.3.2',
        'moviepy>=1.0.3',
        'psycopg2-binary>=2.9.9',
        'yt-dlp>=2023.12.30',
        'python-dotenv>=1.0.0',
        'requests>=2.31.0',
        'opencv-python>=4.8.1.78',
        'tqdm>=4.66.1',
    ],
)
