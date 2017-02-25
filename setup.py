from setuptools import setup, find_packages
from codecs import open


NAME = 's'
DESC = 'website portal komunitas python surabaya.py'
AUTHOR = 'Nanang Suryadi'
AUTHOR_EMAIL = 'nanang.ask@gmail.com'
URL = 'https://github.com/surabaya-py/s.git'
LICENSE = 'GNU GPL License'
KEYWORDS = ['baka', 'framework', 'pyramid']
CLASSIFIERS = [
    'Development Status :: 4 - Beta',
    'Environment :: Console',
    'Environment :: Web Environment',
    'Framework :: Pyramid',
    'Intended Audience :: Developers',
    'License :: OSI Approved :: BSD License',
    'Operating System :: OS Independent',
    'Programming Language :: Python :: 2.7. 3.4+',
]
INSTALL_REQUIRES = [
    'setuptools',
    'pyramid',
    'pyramid-debugtoolbar',
    'pyramid-mako',
    'pyramid_mailer',
    'apscheduler'
]
EXTRAS_REQUIRE = {
    'dev': ['check-manifest'],
    'test': ['coverage'],
}
ENTRY_POINTS = """\
      [paste.app_factory]
      main = s:main
      """

with open('README.rst', encoding='utf-8') as fp:
    LONGDESC = fp.read()


setup(name=NAME,
      version='0.1.1',
      description=DESC,
      long_description=LONGDESC,
      classifiers=CLASSIFIERS,
      keywords=KEYWORDS,
      author=AUTHOR,
      author_email=AUTHOR_EMAIL,
      url=URL,
      license=LICENSE,
      include_package_data=True,
      dependency_links=['https://github.com/baka-framework/s.git/tree/master#egg=s'],
      install_requires=INSTALL_REQUIRES,
      extras_require=EXTRAS_REQUIRE,
      entry_points=ENTRY_POINTS,
      packages=find_packages(include=['s', 's.*']),
      zip_safe=False)
