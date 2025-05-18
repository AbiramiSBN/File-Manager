#include "MainWindow.h"
#include <QDesktopServices>
#include <QUrl>
#include <QDir>
#include <QHBoxLayout>

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
{
    // Create widgets
    model = new QFileSystemModel(this);
    model->setRootPath(QDir::homePath());
    model->setFilter(QDir::AllEntries | QDir::NoDotAndDotDot);

    view = new QListView(this);
    view->setModel(model);
    view->setRootIndex(model->index(QDir::homePath()));
    view->setViewMode(QListView::IconMode);
    view->setIconSize(QSize(64, 64));
    view->setResizeMode(QListView::Adjust);
    view->setGridSize(QSize(100, 100));

    connect(view, &QListView::activated,
            this, &MainWindow::onItemActivated);

    // Toolbar with back button and path display
    QToolBar *toolbar = addToolBar("Navigation");
    backAction = toolbar->addAction("← Back");
    backAction->setEnabled(false);
    connect(backAction, &QAction::triggered,
            this, &MainWindow::onBack);

    pathEdit = new QLineEdit(QDir::homePath(), this);
    pathEdit->setReadOnly(true);
    toolbar->addWidget(pathEdit);

    // Set central widget
    QWidget *central = new QWidget(this);
    QHBoxLayout *layout = new QHBoxLayout(central);
    layout->addWidget(view);
    setCentralWidget(central);

    setWindowTitle("Qt File Manager");
    resize(800, 600);
}

void MainWindow::navigateTo(const QString &path) {
    if (!history.isEmpty()) {}
    view->setRootIndex(model->index(path));
    pathEdit->setText(path);
    backAction->setEnabled(!history.isEmpty());
}

void MainWindow::onItemActivated(const QModelIndex &index) {
    QString path = model->filePath(index);
    if (model->isDir(index)) {
        // navigate into directory
        history.append(pathEdit->text());
        navigateTo(path);
    } else {
        // open file with default application
        QDesktopServices::openUrl(QUrl::fromLocalFile(path));
    }
}

void MainWindow::onBack() {
    if (history.isEmpty()) return;
    QString prev = history.takeLast();
    navigateTo(prev);
}